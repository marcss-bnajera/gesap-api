import {
    Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

type JwtUser = { id: number; email: string; hospitalId?: number | null };

const ENTITY_MAP: Record<string, string> = {
    users: 'User',
    patients: 'Patient',
    emergencies: 'Emergency',
    'unidentified-patients': 'UnidentifiedPatient',
    roles: 'Role',
    hospitals: 'Hospital',
    auth: 'Auth',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const req = context.switchToHttp().getRequest<Request & { user?: JwtUser }>();
        const { method } = req;

        if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
            return next.handle();
        }

        const startedAt = Date.now();

        return next.handle().pipe(
            tap({
                next: async (data: unknown) => {
                    try {
                        const user = req.user;
                        if (!user) return;

                        const forwarded = req.headers['x-forwarded-for'] as string | undefined;
                        const rawIp = forwarded ? forwarded.split(',')[0].trim() : (req.ip ?? null);
                        const ipAddress = rawIp?.startsWith('::ffff:') ? rawIp.slice(7) : rawIp ?? null;

                        await this.prisma.auditLog.create({
                            data: {
                                userId: user.id,
                                userEmail: user.email,
                                action: this.deriveAction(method, req.url),
                                entity: this.deriveEntity(req.url),
                                entityId: this.deriveEntityId(req.url, data as Record<string, unknown>),
                                ipAddress,
                                hospitalId: user.hospitalId ?? null,
                                details: { durationMs: Date.now() - startedAt },
                            },
                        });
                    } catch {
                        // best-effort: no interrumpir la request si falla el log
                    }
                },
            }),
        );
    }

    private deriveAction(method: string, url: string): string {
        const lower = url.toLowerCase();
        if (method === 'DELETE') return 'DELETE';
        if (method === 'PATCH' || method === 'PUT') {
            if (lower.includes('/toggle-active')) return 'TOGGLE_ACTIVE';
            return 'UPDATE';
        }
        // POST
        if (lower.includes('/login')) return 'LOGIN';
        if (lower.includes('/approve')) return 'APPROVE';
        if (lower.includes('/reject')) return 'REJECT';
        if (lower.includes('/identify')) return 'IDENTIFY';
        if (lower.includes('/assign')) return 'ASSIGN';
        if (lower.includes('/complete')) return 'COMPLETE';
        if (lower.includes('/toggle-active')) return 'TOGGLE_ACTIVE';
        return 'CREATE';
    }

    private deriveEntity(url: string): string {
        const segments = url.split('/').filter(Boolean);
        for (const seg of segments) {
            if (ENTITY_MAP[seg]) return ENTITY_MAP[seg];
        }
        return 'Unknown';
    }

    private deriveEntityId(url: string, data: Record<string, unknown> | null): number | undefined {
        if (typeof data?.id === 'number') return data.id;
        const match = url.match(/\/(\d+)(?:[/?]|$)/);
        return match ? parseInt(match[1], 10) : undefined;
    }
}
