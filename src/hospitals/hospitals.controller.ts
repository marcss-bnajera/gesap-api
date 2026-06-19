import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HospitalsService } from './hospitals.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Hospitals')
@ApiBearerAuth('JWT')
@Controller('hospitals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HospitalsController {
    constructor(private service: HospitalsService) {}

    @ApiOperation({ summary: 'Listar hospitales activos', description: 'Accesible para todo el personal clínico.' })
    @ApiResponse({ status: 200, description: 'Lista de hospitales activos' })
    @Get('active')
    @Roles('DOCTOR', 'ASISTENTE_PREHOSPITALARIO', 'ASISTENTE_RECEPCION_CLINICA', 'AUDITOR', 'SUPER_AUDITOR')
    findActive() {
        return this.service.findActive();
    }
}
