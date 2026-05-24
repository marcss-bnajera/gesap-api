import {
    Controller, Get, Post, Put, Patch, Delete,
    Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Patients')
@ApiBearerAuth('JWT')
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
    constructor(private patientsService: PatientsService) { }

    // ===========================================
    // CRUD PACIENTES
    // ===========================================

    @ApiOperation({ summary: 'Crear paciente', description: 'Registra un nuevo paciente en el sistema. El DPI debe ser único.' })
    @ApiResponse({ status: 201, description: 'Paciente creado exitosamente' })
    @ApiResponse({ status: 409, description: 'DPI ya existe en el sistema' })
    @Post()
    @Roles('AUDITOR', 'DOCTOR')
    create(@Body() dto: CreatePatientDto) {
        return this.patientsService.create(dto);
    }

    @ApiOperation({ summary: 'Listar pacientes' })
    @ApiResponse({ status: 200, description: 'Lista de pacientes' })
    @Get()
    @Roles('AUDITOR', 'DOCTOR')
    findAll() {
        return this.patientsService.findAll();
    }

    @ApiOperation({ summary: 'Obtener paciente por ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Datos completos del paciente' })
    @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
    @Get(':id')
    @Roles('AUDITOR', 'DOCTOR')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.patientsService.findOne(id);
    }

    @ApiOperation({ summary: 'Actualizar paciente' })
    @ApiParam({ name: 'id', type: Number })
    @Put(':id')
    @Roles('AUDITOR', 'DOCTOR')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePatientDto) {
        return this.patientsService.update(id, dto);
    }

    @ApiOperation({ summary: 'Eliminar paciente', description: 'Solo SUPER_AUDITOR puede eliminar pacientes.' })
    @ApiParam({ name: 'id', type: Number })
    @Delete(':id')
    @Roles('AUDITOR', 'SUPER_AUDITOR')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.patientsService.remove(id);
    }

    // ===========================================
    // BUSQUEDA POR DPI — GLOBAL
    // ===========================================

    @ApiOperation({ summary: 'Buscar paciente por DPI', description: 'Búsqueda global que cruza todos los hospitales. Retorna datos del paciente con alergias, tratamientos activos y contactos de emergencia.' })
    @ApiParam({ name: 'dpi', type: String, example: '2893459812345' })
    @ApiResponse({ status: 200, description: 'Paciente encontrado' })
    @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
    @Get('dpi/:dpi')
    @Roles('AUDITOR', 'DOCTOR', 'ASISTENTE_PREHOSPITALARIO', 'SUPER_AUDITOR')
    findByDpi(@Param('dpi') dpi: string) {
        return this.patientsService.findByDpi(dpi);
    }

    // ===========================================
    // CONTACTOS DE EMERGENCIA (max 5)
    // ===========================================

    @ApiOperation({ summary: 'Agregar contacto de emergencia', description: 'Máximo 5 contactos activos por paciente.' })
    @ApiResponse({ status: 201, description: 'Contacto creado' })
    @ApiResponse({ status: 400, description: 'El paciente ya tiene 5 contactos activos' })
    @Post('emergency-contacts')
    @Roles('AUDITOR', 'DOCTOR')
    createEmergencyContact(@Body() dto: CreateEmergencyContactDto) {
        return this.patientsService.createEmergencyContact(dto);
    }

    @ApiOperation({ summary: 'Listar contactos de emergencia del paciente' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del paciente' })
    @Get(':id/emergency-contacts')
    @Roles('AUDITOR', 'DOCTOR', 'ASISTENTE_PREHOSPITALARIO')
    findEmergencyContacts(@Param('id', ParseIntPipe) id: number) {
        return this.patientsService.findEmergencyContacts(id);
    }

    @ApiOperation({ summary: 'Actualizar contacto de emergencia' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del contacto' })
    @Put('emergency-contacts/:id')
    @Roles('AUDITOR', 'DOCTOR')
    updateEmergencyContact(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEmergencyContactDto,
    ) {
        return this.patientsService.updateEmergencyContact(id, dto);
    }

    @ApiOperation({ summary: 'Eliminar contacto de emergencia' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del contacto' })
    @Delete('emergency-contacts/:id')
    @Roles('AUDITOR', 'DOCTOR')
    removeEmergencyContact(@Param('id', ParseIntPipe) id: number) {
        return this.patientsService.removeEmergencyContact(id);
    }

    // ===========================================
    // ALERGIAS
    // ===========================================

    @ApiOperation({ summary: 'Registrar alergia del paciente' })
    @ApiResponse({ status: 201, description: 'Alergia registrada' })
    @Post('allergies')
    @Roles('AUDITOR', 'DOCTOR')
    createAllergy(@Body() dto: CreateAllergyDto) {
        return this.patientsService.createAllergy(dto);
    }

    @ApiOperation({ summary: 'Listar alergias del paciente', description: 'Accesible también por ASISTENTE_PREHOSPITALARIO para contexto de emergencias.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del paciente' })
    @Get(':id/allergies')
    @Roles('AUDITOR', 'DOCTOR', 'ASISTENTE_PREHOSPITALARIO')
    findAllergies(@Param('id', ParseIntPipe) id: number) {
        return this.patientsService.findAllergies(id);
    }

    @ApiOperation({ summary: 'Eliminar alergia' })
    @ApiParam({ name: 'id', type: Number, description: 'ID de la alergia' })
    @Delete('allergies/:id')
    @Roles('AUDITOR', 'DOCTOR')
    removeAllergy(@Param('id', ParseIntPipe) id: number) {
        return this.patientsService.removeAllergy(id);
    }

    // ===========================================
    // EXPEDIENTES MEDICOS
    // ===========================================

    @ApiOperation({ summary: 'Crear expediente médico', description: 'El expediente queda vinculado al doctor y hospital que lo crea.' })
    @ApiResponse({ status: 201, description: 'Expediente creado' })
    @Post('medical-records')
    @Roles('DOCTOR')
    createMedicalRecord(
        @CurrentUser() currentUser: { id: number; hospitalId: number | null },
        @Body() dto: CreateMedicalRecordDto,
    ) {
        return this.patientsService.createMedicalRecord(currentUser.id, currentUser.hospitalId, dto);
    }

    @ApiOperation({ summary: 'Listar expedientes médicos del paciente', description: 'Incluye registros de todos los hospitales donde fue atendido.' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del paciente' })
    @Get(':id/medical-records')
    @Roles('AUDITOR', 'DOCTOR')
    findMedicalRecords(@Param('id', ParseIntPipe) id: number) {
        return this.patientsService.findMedicalRecords(id);
    }

    // ===========================================
    // TRATAMIENTOS
    // ===========================================

    @ApiOperation({ summary: 'Crear tratamiento', description: 'El tratamiento queda vinculado al doctor y hospital que lo crea.' })
    @ApiResponse({ status: 201, description: 'Tratamiento creado' })
    @Post('treatments')
    @Roles('DOCTOR')
    createTreatment(
        @CurrentUser() currentUser: { id: number; hospitalId: number | null },
        @Body() dto: CreateTreatmentDto,
    ) {
        return this.patientsService.createTreatment(currentUser.id, currentUser.hospitalId, dto);
    }

    @ApiOperation({ summary: 'Listar tratamientos del paciente' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del paciente' })
    @Get(':id/treatments')
    @Roles('AUDITOR', 'DOCTOR')
    findTreatments(@Param('id', ParseIntPipe) id: number) {
        return this.patientsService.findTreatments(id);
    }

    @ApiOperation({ summary: 'Desactivar tratamiento', description: 'Marca el tratamiento como inactivo (no lo elimina).' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del tratamiento' })
    @Patch('treatments/:id/deactivate')
    @Roles('AUDITOR', 'DOCTOR')
    deactivateTreatment(@Param('id', ParseIntPipe) id: number) {
        return this.patientsService.deactivateTreatment(id);
    }
}
