import {
    Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getHospitalScope, HospitalScopedUser } from '../../common/helpers/hospital-scope.helper';
import { CreateUnidentifiedPatientDto } from './dto/create-unidentified-patient.dto';
import { IdentifyPatientDto } from './dto/identify-patient.dto';

@Injectable()
export class UnidentifiedPatientsService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateUnidentifiedPatientDto, currentUser: { id: number }) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { id: dto.hospitalId },
        });

        if (!hospital) {
            throw new NotFoundException(`No existe el hospital con ID ${dto.hospitalId}`);
        }

        return this.prisma.unidentifiedPatient.create({
            data: {
                ...dto,
                transferDate: new Date(dto.transferDate),
                createdById: currentUser.id,
            },
            include: {
                hospital: { select: { id: true, code: true, name: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }

    async findAll(currentUser: HospitalScopedUser & { id: number }, hospitalIdFilter?: number) {
        const scope = getHospitalScope(currentUser);

        // ASISTENTE_RECEPCION_CLINICA usa su propio hospital sin importar el query param
        const hospitalId = currentUser.roleName === 'SUPER_AUDITOR'
            ? hospitalIdFilter
            : currentUser.hospitalId ?? undefined;

        const where = hospitalId !== undefined
            ? { ...scope, hospitalId }
            : scope;

        return this.prisma.unidentifiedPatient.findMany({
            where: { ...where, isActive: true },
            include: {
                hospital: { select: { id: true, code: true, name: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                identifiedPatient: {
                    select: { id: true, dpi: true, firstName: true, firstLastName: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number, currentUser: HospitalScopedUser) {
        const scope = getHospitalScope(currentUser);

        const record = await this.prisma.unidentifiedPatient.findFirst({
            where: { id, ...scope, isActive: true },
            include: {
                hospital: { select: { id: true, code: true, name: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                identifiedPatient: {
                    select: { id: true, dpi: true, firstName: true, firstLastName: true, secondLastName: true },
                },
                emergencies: { select: { id: true, status: true, createdAt: true } },
            },
        });

        if (!record) {
            throw new NotFoundException(`No se encontró el paciente no identificado con ID ${id}`);
        }

        return record;
    }

    async identify(id: number, dto: IdentifyPatientDto, currentUser: HospitalScopedUser) {
        await this.findOne(id, currentUser);

        const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });

        if (!patient) {
            throw new NotFoundException(`No existe el paciente con ID ${dto.patientId}`);
        }

        return this.prisma.unidentifiedPatient.update({
            where: { id },
            data: { identifiedPatientId: dto.patientId },
            include: {
                identifiedPatient: {
                    select: { id: true, dpi: true, firstName: true, firstLastName: true },
                },
            },
        });
    }
}
