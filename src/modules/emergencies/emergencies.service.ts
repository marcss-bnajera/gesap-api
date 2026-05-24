import {
    Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { EmergencyStatus, AvailabilityStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { getHospitalScope, HospitalScopedUser } from '../../common/helpers/hospital-scope.helper';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { UpdateEmergencyDto } from './dto/update-emergency.dto';
import { CompleteEmergencyDto } from './dto/complete-emergency.dto';
import { FilterEmergenciesDto } from './dto/filter-emergencies.dto';

// Include estándar para retornar emergencias con sus relaciones
const EMERGENCY_INCLUDE = {
    patient: {
        select: {
            id: true, dpi: true, firstName: true, firstLastName: true,
            secondLastName: true, bloodType: true,
        },
    },
    unidentifiedPatient: {
        select: { id: true, sex: true, estimatedAge: true, additionalNotes: true },
    },
    createdBy: { select: { id: true, firstName: true, lastName: true, fleetId: true } },
    assignedTo: { select: { id: true, firstName: true, lastName: true } },
    hospitalDestination: { select: { id: true, code: true, name: true, department: true } },
} as const;

@Injectable()
export class EmergenciesService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateEmergencyDto, currentUser: { id: number }) {
        // Exactamente uno de los dos debe estar presente
        const hasPatient = !!dto.patientId;
        const hasUnidentified = !!dto.unidentifiedPatientId;

        if (!hasPatient && !hasUnidentified) {
            throw new BadRequestException(
                'Se requiere patientId o unidentifiedPatientId',
            );
        }

        if (hasPatient && hasUnidentified) {
            throw new BadRequestException(
                'patientId y unidentifiedPatientId son mutuamente excluyentes',
            );
        }

        const hospital = await this.prisma.hospital.findUnique({
            where: { id: dto.hospitalDestinationId },
        });

        if (!hospital) {
            throw new NotFoundException(
                `No existe el hospital con ID ${dto.hospitalDestinationId}`,
            );
        }

        if (hasPatient) {
            const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
            if (!patient) throw new NotFoundException(`No existe el paciente con ID ${dto.patientId}`);
        }

        if (hasUnidentified) {
            const up = await this.prisma.unidentifiedPatient.findUnique({
                where: { id: dto.unidentifiedPatientId },
            });
            if (!up) throw new NotFoundException(`No existe el paciente no identificado con ID ${dto.unidentifiedPatientId}`);
        }

        return this.prisma.emergency.create({
            data: {
                patientId: dto.patientId,
                unidentifiedPatientId: dto.unidentifiedPatientId,
                hospitalDestinationId: dto.hospitalDestinationId,
                primaryAssessment: dto.primaryAssessment as Prisma.InputJsonValue ?? Prisma.JsonNull,
                secondaryAssessment: dto.secondaryAssessment as Prisma.InputJsonValue ?? Prisma.JsonNull,
                notes: dto.notes,
                transferDate: dto.transferDate ? new Date(dto.transferDate) : undefined,
                createdById: currentUser.id,
                status: EmergencyStatus.PENDING,
            },
            include: EMERGENCY_INCLUDE,
        });
    }

    async update(id: number, dto: UpdateEmergencyDto, currentUser: { id: number }) {
        const emergency = await this.prisma.emergency.findUnique({ where: { id } });

        if (!emergency) {
            throw new NotFoundException(`No existe la emergencia con ID ${id}`);
        }

        if (emergency.status !== EmergencyStatus.PENDING) {
            throw new BadRequestException(
                'Solo se pueden actualizar emergencias en estado PENDING',
            );
        }

        return this.prisma.emergency.update({
            where: { id },
            data: {
                ...(dto.primaryAssessment !== undefined && {
                    primaryAssessment: dto.primaryAssessment as Prisma.InputJsonValue,
                }),
                ...(dto.secondaryAssessment !== undefined && {
                    secondaryAssessment: dto.secondaryAssessment as Prisma.InputJsonValue,
                }),
                ...(dto.notes !== undefined && { notes: dto.notes }),
            },
            include: EMERGENCY_INCLUDE,
        });
    }

    async assign(id: number, currentUser: HospitalScopedUser & { id: number; availabilityStatus: string | null }) {
        const emergency = await this.prisma.emergency.findUnique({ where: { id } });

        if (!emergency) {
            throw new NotFoundException(`No existe la emergencia con ID ${id}`);
        }

        if (emergency.status !== EmergencyStatus.PENDING) {
            throw new BadRequestException('Solo se puede asignar una emergencia en estado PENDING');
        }

        if (currentUser.availabilityStatus !== AvailabilityStatus.AVAILABLE) {
            throw new BadRequestException(
                'Debes estar en estado AVAILABLE para asignar una emergencia',
            );
        }

        if (currentUser.hospitalId !== emergency.hospitalDestinationId) {
            throw new ForbiddenException(
                'Solo puedes asignarte emergencias destinadas a tu hospital',
            );
        }

        // Transacción: actualizar emergencia + estado del asistente
        const [updatedEmergency] = await this.prisma.$transaction([
            this.prisma.emergency.update({
                where: { id },
                data: {
                    status: EmergencyStatus.IN_PROGRESS,
                    assignedToId: currentUser.id,
                },
                include: EMERGENCY_INCLUDE,
            }),
            this.prisma.user.update({
                where: { id: currentUser.id },
                data: { availabilityStatus: AvailabilityStatus.BUSY },
            }),
        ]);

        return updatedEmergency;
    }

    async complete(
        id: number,
        dto: CompleteEmergencyDto,
        currentUser: HospitalScopedUser & { id: number },
    ) {
        const emergency = await this.prisma.emergency.findUnique({ where: { id } });

        if (!emergency) {
            throw new NotFoundException(`No existe la emergencia con ID ${id}`);
        }

        if (emergency.status !== EmergencyStatus.IN_PROGRESS) {
            throw new BadRequestException(
                'Solo se puede completar una emergencia en estado IN_PROGRESS',
            );
        }

        if (emergency.assignedToId !== currentUser.id) {
            throw new ForbiddenException(
                'Solo el asistente asignado puede completar esta emergencia',
            );
        }

        const completionRecord = {
            ...dto.completionRecord,
            completed_at: new Date().toISOString(),
        } as Prisma.InputJsonValue;

        // Transacción: completar emergencia + liberar asistente
        const [updatedEmergency] = await this.prisma.$transaction([
            this.prisma.emergency.update({
                where: { id },
                data: {
                    status: EmergencyStatus.COMPLETED,
                    completionRecord,
                },
                include: EMERGENCY_INCLUDE,
            }),
            this.prisma.user.update({
                where: { id: currentUser.id },
                data: { availabilityStatus: AvailabilityStatus.AVAILABLE },
            }),
        ]);

        return updatedEmergency;
    }

    async findPendingByHospital(
        hospitalId: number,
        currentUser: HospitalScopedUser & { id: number },
    ) {
        if (currentUser.hospitalId !== hospitalId) {
            throw new ForbiddenException(
                'Solo puedes ver las emergencias pendientes de tu hospital',
            );
        }

        return this.prisma.emergency.findMany({
            where: {
                status: EmergencyStatus.PENDING,
                hospitalDestinationId: hospitalId,
            },
            include: EMERGENCY_INCLUDE,
            orderBy: { createdAt: 'asc' },
        });
    }

    async findOne(id: number, currentUser: HospitalScopedUser) {
        const emergency = await this.prisma.emergency.findUnique({
            where: { id },
            include: EMERGENCY_INCLUDE,
        });

        if (!emergency) {
            throw new NotFoundException(`No existe la emergencia con ID ${id}`);
        }

        // AUDITOR solo ve emergencias de su hospital destino
        if (
            currentUser.roleName === 'AUDITOR' &&
            emergency.hospitalDestinationId !== currentUser.hospitalId
        ) {
            throw new ForbiddenException('No tienes acceso a esta emergencia');
        }

        return emergency;
    }

    async findAll(currentUser: HospitalScopedUser, filters: FilterEmergenciesDto) {
        const scope = getHospitalScope(currentUser);

        // Para AUDITOR el scope ya aplica hospitalId; para SUPER_AUDITOR puede filtrar por param
        const hospitalFilter = currentUser.roleName === 'SUPER_AUDITOR' && filters.hospitalId
            ? { hospitalDestinationId: filters.hospitalId }
            : currentUser.roleName !== 'SUPER_AUDITOR'
                ? { hospitalDestinationId: currentUser.hospitalId ?? undefined }
                : {};

        return this.prisma.emergency.findMany({
            where: {
                ...hospitalFilter,
                ...(filters.status && { status: filters.status }),
            },
            include: EMERGENCY_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }

    async getConstancia(id: number, currentUser: HospitalScopedUser) {
        const emergency = await this.findOne(id, currentUser);

        if (emergency.status !== EmergencyStatus.COMPLETED) {
            throw new BadRequestException(
                'La constancia solo está disponible para emergencias COMPLETED',
            );
        }

        return {
            constancia: {
                emergencyId: emergency.id,
                generatedAt: new Date().toISOString(),
                patient: emergency.patient,
                unidentifiedPatient: emergency.unidentifiedPatient,
                hospitalDestination: emergency.hospitalDestination,
                createdBy: emergency.createdBy,
                assignedTo: emergency.assignedTo,
                transferDate: emergency.transferDate,
                primaryAssessment: emergency.primaryAssessment,
                secondaryAssessment: emergency.secondaryAssessment,
                completionRecord: emergency.completionRecord,
                notes: emergency.notes,
                createdAt: emergency.createdAt,
                updatedAt: emergency.updatedAt,
            },
        };
    }
}
