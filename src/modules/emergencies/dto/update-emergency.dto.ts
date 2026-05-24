import { IsOptional, IsObject, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEmergencyDto {
    @ApiPropertyOptional({
        example: { airway: 'permeable', breathing: 'dificultad_respiratoria' },
        description: 'Evaluación primaria actualizada (JSON libre)',
    })
    @IsOptional()
    @IsObject({ message: 'La evaluación primaria debe ser un objeto JSON' })
    primaryAssessment?: Record<string, unknown>;

    @ApiPropertyOptional({
        example: { symptoms: 'dolor_abdominal', medications: 'insulina' },
        description: 'Evaluación secundaria actualizada (JSON libre)',
    })
    @IsOptional()
    @IsObject({ message: 'La evaluación secundaria debe ser un objeto JSON' })
    secondaryAssessment?: Record<string, unknown>;

    @ApiPropertyOptional({ example: 'Paciente estabilizado en ruta' })
    @IsOptional()
    @IsString()
    notes?: string;
}
