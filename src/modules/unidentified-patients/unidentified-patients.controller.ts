import {
    Controller, Get, Post, Patch, Body, Param,
    ParseIntPipe, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UnidentifiedPatientsService } from './unidentified-patients.service';
import { CreateUnidentifiedPatientDto } from './dto/create-unidentified-patient.dto';
import { IdentifyPatientDto } from './dto/identify-patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { HospitalScopedUser } from '../../common/helpers/hospital-scope.helper';

@ApiTags('Unidentified Patients')
@ApiBearerAuth('JWT')
@Controller('unidentified-patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnidentifiedPatientsController {
    constructor(private service: UnidentifiedPatientsService) {}

    @ApiOperation({ summary: 'Registrar paciente sin identificar', description: 'Solo ASISTENTE_PREHOSPITALARIO. Describe físicamente al paciente para facilitar su identificación posterior.' })
    @ApiResponse({ status: 201, description: 'Paciente sin identificar registrado' })
    @Post()
    @Roles('ASISTENTE_PREHOSPITALARIO')
    create(
        @Body() dto: CreateUnidentifiedPatientDto,
        @CurrentUser() currentUser: HospitalScopedUser & { id: number },
    ) {
        return this.service.create(dto, currentUser);
    }

    @ApiOperation({ summary: 'Listar pacientes sin identificar', description: 'AUDITOR: solo su hospital. SUPER_AUDITOR: todos. Opcionalmente filtrar por hospitalId (query).' })
    @ApiQuery({ name: 'hospitalId', required: false, type: Number, description: 'Filtrar por hospital (SUPER_AUDITOR)' })
    @ApiResponse({ status: 200, description: 'Lista de pacientes sin identificar' })
    @Get()
    @Roles('AUDITOR', 'ASISTENTE_RECEPCION_CLINICA', 'SUPER_AUDITOR')
    findAll(
        @CurrentUser() currentUser: HospitalScopedUser & { id: number },
        @Query('hospitalId') hospitalId?: string,
    ) {
        const parsedHospitalId = hospitalId ? parseInt(hospitalId, 10) : undefined;
        return this.service.findAll(currentUser, parsedHospitalId);
    }

    @ApiOperation({ summary: 'Obtener paciente sin identificar por ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Datos del paciente sin identificar' })
    @Get(':id')
    @Roles('AUDITOR', 'ASISTENTE_RECEPCION_CLINICA', 'SUPER_AUDITOR')
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() currentUser: HospitalScopedUser,
    ) {
        return this.service.findOne(id, currentUser);
    }

    @ApiOperation({ summary: 'Identificar paciente', description: 'Vincula el paciente sin identificar con un paciente existente en el sistema mediante su ID.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del paciente sin identificar' })
    @ApiResponse({ status: 200, description: 'Paciente identificado y vinculado exitosamente' })
    @Patch(':id/identify')
    @Roles('AUDITOR', 'SUPER_AUDITOR')
    identify(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: IdentifyPatientDto,
        @CurrentUser() currentUser: HospitalScopedUser,
    ) {
        return this.service.identify(id, dto, currentUser);
    }
}
