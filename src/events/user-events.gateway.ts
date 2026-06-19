import {
    WebSocketGateway, WebSocketServer,
    OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

export interface EmergencyNewPayload {
    id: number;
    patientName: string;
    hospitalName: string;
    status: string;
    createdAt: string;
}

// Namespace /user-events: usuarios clínicos y de emergencias conectan aquí.
// Eventos emitidos:
//   session:kicked   → sesión cerrada por auditor
//   emergency:new    → nueva emergencia creada para el hospital destino (solo RECEPCION_CLINICA)
@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/user-events',
    path: '/api-ws',
})
@Injectable()
export class UserEventsGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy
{
    @WebSocketServer()
    server: Server;

    // userId → Set<Socket>
    private userSockets = new Map<number, Set<Socket>>();
    // socketId → userId
    private socketUsers = new Map<string, number>();
    // hospitalId → Set<Socket>  (solo ASISTENTE_RECEPCION_CLINICA)
    private hospitalRecepcionSockets = new Map<number, Set<Socket>>();

    private checkInterval: ReturnType<typeof setInterval>;

    constructor(private prisma: PrismaService) {}

    onModuleInit() {
        this.checkInterval = setInterval(() => this.checkKickedSessions(), 4000);
    }

    onModuleDestroy() {
        clearInterval(this.checkInterval);
    }

    async handleConnection(client: Socket) {
        try {
            const token =
                (client.handshake.auth?.token as string) ||
                (client.handshake.query?.token as string);
            if (!token) { client.disconnect(); return; }

            const payload = jwt.verify(token, process.env.JWT_SECRET!) as unknown as { sub: number };
            const userId = Number(payload.sub);

            this.socketUsers.set(client.id, userId);
            if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
            this.userSockets.get(userId)!.add(client);

            // Si es ASISTENTE_RECEPCION_CLINICA, registrar por hospitalId para emergencias
            try {
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: { hospitalId: true, role: { select: { name: true } } },
                });
                if (user?.role.name === 'ASISTENTE_RECEPCION_CLINICA' && user.hospitalId) {
                    const hid = user.hospitalId;
                    if (!this.hospitalRecepcionSockets.has(hid)) {
                        this.hospitalRecepcionSockets.set(hid, new Set());
                    }
                    this.hospitalRecepcionSockets.get(hid)!.add(client);
                    // Guardar hospitalId en el socket para cleanup
                    (client as Socket & { _hospitalId?: number })._hospitalId = hid;
                }
            } catch { /* no bloquear la conexión si falla el lookup */ }
        } catch {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = this.socketUsers.get(client.id);
        if (userId === undefined) return;

        this.socketUsers.delete(client.id);
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.delete(client);
            if (sockets.size === 0) this.userSockets.delete(userId);
        }

        // Limpiar del mapa de recepción si aplica
        const hid = (client as Socket & { _hospitalId?: number })._hospitalId;
        if (hid !== undefined) {
            const hSockets = this.hospitalRecepcionSockets.get(hid);
            if (hSockets) {
                hSockets.delete(client);
                if (hSockets.size === 0) this.hospitalRecepcionSockets.delete(hid);
            }
        }
    }

    /** Emite 'emergency:new' a todos los ASISTENTE_RECEPCION_CLINICA del hospital destino */
    notifyNewEmergency(hospitalDestinationId: number, payload: EmergencyNewPayload) {
        const sockets = this.hospitalRecepcionSockets.get(hospitalDestinationId);
        if (!sockets || sockets.size === 0) return;
        for (const socket of sockets) {
            socket.emit('emergency:new', payload);
        }
    }

    private async checkKickedSessions() {
        if (this.userSockets.size === 0) return;
        try {
            const userIds = [...this.userSockets.keys()];
            const activeSessions = await this.prisma.loginSession.findMany({
                where: { userId: { in: userIds }, isActive: true },
                select: { userId: true },
            });
            const activeUserIds = new Set(activeSessions.map((s) => s.userId));

            const toKick = userIds.filter((id) => !activeUserIds.has(id));
            for (const userId of toKick) {
                const sockets = this.userSockets.get(userId);
                if (!sockets) continue;
                for (const socket of sockets) {
                    this.socketUsers.delete(socket.id);
                    socket.emit('session:kicked', {
                        message: 'Tu sesión ha sido cerrada por un administrador del sistema.',
                    });
                    socket.disconnect();
                }
                this.userSockets.delete(userId);
            }
        } catch {
            // Ignorar errores de BD; el próximo intervalo reintentará
        }
    }
}
