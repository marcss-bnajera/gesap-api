import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HospitalsService {
    constructor(private prisma: PrismaService) {}

    findActive() {
        return this.prisma.hospital.findMany({
            where: { isActive: true },
            select: { id: true, name: true, code: true, department: true },
            orderBy: { name: 'asc' },
        });
    }
}
