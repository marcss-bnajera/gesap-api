// =============================================
// AuthService
// Logica de autenticacion: login y generacion de JWT
// =============================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto, req?: Request) {
        const { email, password } = loginDto;

        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user) throw new UnauthorizedException('Credenciales incorrectas');
        if (!user.isActive) throw new UnauthorizedException('Tu cuenta esta desactivada, contacta al administrador');

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) throw new UnauthorizedException('Credenciales incorrectas');

        const payload = { sub: user.id, email: user.email };
        const token = this.jwtService.sign(payload);

        // Registrar sesion de login: upsert (una sesion activa por usuario)
        try {
            // CF-Connecting-IP (Cloudflare Tunnel) → x-forwarded-for → req.ip
            const cfIp = req?.headers?.['cf-connecting-ip'] as string | undefined;
            const forwarded = req?.headers?.['x-forwarded-for'] as string | undefined;
            const rawIp = cfIp?.trim() ?? (forwarded ? forwarded.split(',')[0].trim() : (req?.ip ?? null));
            const ip = rawIp?.startsWith('::ffff:') ? rawIp.slice(7) : rawIp ?? null;
            const ua = req?.headers['user-agent'] ?? null;
            const existing = await this.prisma.loginSession.findFirst({
                where: { userId: user.id, isActive: true },
            });
            if (existing) {
                await this.prisma.loginSession.update({
                    where: { id: existing.id },
                    data: { token, ipAddress: ip, userAgent: ua, lastActiveAt: new Date() },
                });
            } else {
                await this.prisma.loginSession.create({
                    data: {
                        userId: user.id,
                        token,
                        hospitalId: user.hospitalId ?? null,
                        ipAddress: ip,
                        userAgent: ua,
                    },
                });
            }
        } catch {
            // best-effort
        }

        return {
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role.name,
                hospitalId: user.hospitalId,
            },
        };
    }

    // Obtener perfil del usuario autenticado
    async getProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        // No enviar la contrasena
        const { password, ...result } = user;
        return result;
    }
}