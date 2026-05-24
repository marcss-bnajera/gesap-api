import { IsNotEmpty, IsString, IsOptional, IsInt, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMedicalRecordDto {
    @ApiProperty({ example: 1, description: 'ID del paciente' })
    @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
    @IsInt({ message: 'El ID del paciente debe ser un numero entero' })
    @Min(1, { message: 'El ID del paciente debe ser mayor a 0' })
    patientId: number;

    @ApiProperty({ example: 'Hipertensión arterial grado I', description: 'Diagnóstico médico' })
    @IsNotEmpty({ message: 'El diagnostico es obligatorio' })
    @IsString({ message: 'El diagnostico debe ser texto' })
    diagnosis: string;

    @ApiPropertyOptional({ example: 'Paciente con antecedentes familiares de hipertensión' })
    @IsOptional()
    @IsString({ message: 'Las notas deben ser texto' })
    notes?: string;

    @ApiPropertyOptional({
        example: { weight: 70, height: 170, blood_pressure: '120/80', temperature: 36.5, heart_rate: 72 },
        description: 'Signos vitales en formato JSON',
    })
    @IsOptional()
    @IsObject({ message: 'Los signos vitales deben ser un objeto JSON' })
    vitalSigns?: Record<string, any>;
}
