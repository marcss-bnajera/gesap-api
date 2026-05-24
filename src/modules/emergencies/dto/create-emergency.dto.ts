import {
    IsOptional, IsInt, IsObject, IsString, IsDateString, Min, ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmergencyDto {
    @ApiPropertyOptional({ example: 1, description: 'ID del paciente identificado (excluyente con unidentifiedPatientId)' })
    @IsOptional()
    @IsInt()
    @Min(1)
    patientId?: number;

    @ApiPropertyOptional({ example: null, description: 'ID del paciente sin identificar (excluyente con patientId)' })
    @IsOptional()
    @IsInt()
    @Min(1)
    unidentifiedPatientId?: number;

    @ApiProperty({ example: 1, description: 'ID del hospital destino donde se traslada al paciente' })
    @IsInt({ message: 'El hospital destino es obligatorio' })
    @Min(1)
    hospitalDestinationId: number;

    @ApiPropertyOptional({
        example: { airway: 'permeable', breathing: 'normal', circulation: 'pulso_presente', disability: 'consciente', exposure: 'sin_lesiones_visibles' },
        description: 'Evaluación primaria ABCDE (JSON libre)',
    })
    @IsOptional()
    @IsObject({ message: 'La evaluación primaria debe ser un objeto JSON' })
    primaryAssessment?: Record<string, unknown>;

    @ApiPropertyOptional({
        example: { symptoms: 'dolor_torácico', allergies: 'ninguna', medications: 'ninguno', history: 'HTA', events: 'inicio_súbito' },
        description: 'Evaluación secundaria SAMPLE (JSON libre)',
    })
    @IsOptional()
    @IsObject({ message: 'La evaluación secundaria debe ser un objeto JSON' })
    secondaryAssessment?: Record<string, unknown>;

    @ApiPropertyOptional({ example: 'Paciente encontrado inconsciente en vía pública' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ example: '2024-06-15T14:30:00.000Z', description: 'Fecha de traslado en ISO 8601' })
    @IsOptional()
    @IsDateString({}, { message: 'Fecha de traslado debe ser ISO 8601' })
    transferDate?: string;
}
