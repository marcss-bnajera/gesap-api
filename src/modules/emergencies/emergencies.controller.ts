// IMPORTANTE: El orden de declaración importa en NestJS.
// Las rutas con segmentos estáticos (pending, constancia) deben ir
// ANTES de las rutas con parámetros dinámicos (:id) para evitar conflictos.

import {
    Controller, Get, Post, Patch, Body, Param,
    ParseIntPipe, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EmergenciesService } from './emergencies.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { UpdateEmergencyDto } from './dto/update-emergency.dto';
import { CompleteEmergencyDto } from './dto/complete-emergency.dto';
import { FilterEmergenciesDto } from './dto/filter-emergencies.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { HospitalScopedUser } from '../../common/helpers/hospital-scope.helper';

type AuthUser = HospitalScopedUser & {
    id: number;
    availabilityStatus: string | null;
};

@ApiTags('Emergencies')
@ApiBearerAuth('JWT')
@Controller('emergencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmergenciesController {
    constructor(private service: EmergenciesService) {}

    @ApiOperation({ summary: 'Crear emergencia', description: 'Solo ASISTENTE_PREHOSPITALARIO puede crear emergencias. Se debe enviar patientId o unidentifiedPatientId (no ambos).' })
    @ApiResponse({ status: 201, description: 'Emergencia creada en estado PENDING' })
    @Post()
    @Roles('ASISTENTE_PREHOSPITALARIO')
    create(
        @Body() dto: CreateEmergencyDto,
        @CurrentUser() currentUser: AuthUser,
    ) {
        return this.service.create(dto, currentUser);
    }

    @ApiOperation({ summary: 'Listar emergencias', description: 'AUDITOR: solo su hospital. SUPER_AUDITOR: todos. Soporta filtros por status y hospitalId.' })
    @ApiResponse({ status: 200, description: 'Lista de emergencias' })
    @Get()
    @Roles('AUDITOR', 'SUPER_AUDITOR')
    findAll(
        @CurrentUser() currentUser: AuthUser,
        @Query() filters: FilterEmergenciesDto,
    ) {
        return this.service.findAll(currentUser, filters);
    }

    @ApiOperation({ summary: 'Listar emergencias pendientes por hospital', description: 'Usado por ASISTENTE_RECEPCION_CLINICA para ver las emergencias entrantes de su hospital.' })
    @ApiParam({ name: 'hospitalId', type: Number, description: 'ID del hospital' })
    @ApiResponse({ status: 200, description: 'Emergencias en estado PENDING del hospital' })
    @Get('pending/:hospitalId')
    @Roles('ASISTENTE_RECEPCION_CLINICA')
    findPending(
        @Param('hospitalId', ParseIntPipe) hospitalId: number,
        @CurrentUser() currentUser: AuthUser,
    ) {
        return this.service.findPendingByHospital(hospitalId, currentUser);
    }

    @ApiOperation({ summary: 'Listar mis emergencias creadas', description: 'ASISTENTE_PREHOSPITALARIO obtiene todas las emergencias que él mismo ha creado.' })
    @ApiResponse({ status: 200, description: 'Emergencias creadas por el usuario autenticado' })
    @Get('mine')
    @Roles('ASISTENTE_PREHOSPITALARIO')
    findMine(@CurrentUser() currentUser: AuthUser) {
        return this.service.findMine(currentUser);
    }

    @ApiOperation({ summary: 'Listar todas las emergencias de un hospital', description: 'ASISTENTE_RECEPCION_CLINICA obtiene todas las emergencias (cualquier estado) de su hospital.' })
    @ApiParam({ name: 'hospitalId', type: Number })
    @ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado (PENDING, IN_PROGRESS, COMPLETED)' })
    @ApiResponse({ status: 200, description: 'Emergencias del hospital' })
    @Get('hospital/:hospitalId')
    @Roles('ASISTENTE_RECEPCION_CLINICA')
    findByHospital(
        @Param('hospitalId', ParseIntPipe) hospitalId: number,
        @Query('status') status: string | undefined,
        @CurrentUser() currentUser: AuthUser,
    ) {
        return this.service.findByHospital(hospitalId, currentUser, status);
    }

    @ApiOperation({ summary: 'Obtener emergencia por ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Datos completos de la emergencia' })
    @ApiResponse({ status: 404, description: 'Emergencia no encontrada' })
    @Get(':id')
    @Roles('ASISTENTE_PREHOSPITALARIO', 'ASISTENTE_RECEPCION_CLINICA', 'AUDITOR', 'SUPER_AUDITOR')
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() currentUser: AuthUser,
    ) {
        return this.service.findOne(id, currentUser);
    }

    @ApiOperation({ summary: 'Obtener constancia de emergencia', description: 'Retorna el documento de constancia de una emergencia COMPLETED.' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Constancia de la emergencia completada' })
    @ApiResponse({ status: 400, description: 'La emergencia no está completada' })
    @Get(':id/constancia')
    @Roles('AUDITOR', 'SUPER_AUDITOR', 'ASISTENTE_RECEPCION_CLINICA')
    getConstancia(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() currentUser: AuthUser,
    ) {
        return this.service.getConstancia(id, currentUser);
    }

    @ApiOperation({ summary: 'Actualizar emergencia', description: 'Solo ASISTENTE_PREHOSPITALARIO puede actualizar la emergencia mientras está en PENDING.' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Emergencia actualizada' })
    @Patch(':id')
    @Roles('ASISTENTE_PREHOSPITALARIO')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEmergencyDto,
        @CurrentUser() currentUser: AuthUser,
    ) {
        return this.service.update(id, dto, currentUser);
    }

    @ApiOperation({ summary: 'Asignar emergencia', description: 'ASISTENTE_RECEPCION_CLINICA asigna la emergencia a sí mismo, cambiando el estado a IN_PROGRESS.' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Emergencia asignada — estado cambia a IN_PROGRESS' })
    @Patch(':id/assign')
    @Roles('ASISTENTE_RECEPCION_CLINICA')
    assign(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() currentUser: AuthUser,
    ) {
        return this.service.assign(id, currentUser);
    }

    @ApiOperation({ summary: 'Completar emergencia', description: 'ASISTENTE_RECEPCION_CLINICA completa la emergencia, cambiando el estado a COMPLETED.' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Emergencia completada — estado cambia a COMPLETED' })
    @Patch(':id/complete')
    @Roles('ASISTENTE_RECEPCION_CLINICA')
    complete(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CompleteEmergencyDto,
        @CurrentUser() currentUser: AuthUser,
    ) {
        return this.service.complete(id, dto, currentUser);
    }
}
