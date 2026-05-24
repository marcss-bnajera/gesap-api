import { IsNotEmpty, IsString, IsEnum, IsOptional, IsInt, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AllergyTypeEnum {
    MEDICATION = 'MEDICATION',
    FOOD = 'FOOD',
    ENVIRONMENTAL = 'ENVIRONMENTAL',
    OTHER = 'OTHER',
}

export enum AllergySeverityEnum {
    MILD = 'MILD',
    MODERATE = 'MODERATE',
    SEVERE = 'SEVERE',
}

export class CreateAllergyDto {
    @ApiProperty({ example: 1, description: 'ID del paciente' })
    @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
    @IsInt({ message: 'El ID del paciente debe ser un numero entero' })
    @Min(1, { message: 'El ID del paciente debe ser mayor a 0' })
    patientId: number;

    @ApiProperty({ example: 'Penicilina', description: 'Sustancia que causa la alergia' })
    @IsNotEmpty({ message: 'La sustancia alergica es obligatoria' })
    @IsString({ message: 'La sustancia debe ser texto' })
    @MaxLength(100, { message: 'La sustancia no puede exceder 100 caracteres' })
    substance: string;

    @ApiProperty({ enum: AllergyTypeEnum, example: 'MEDICATION' })
    @IsNotEmpty({ message: 'El tipo de alergia es obligatorio' })
    @IsEnum(AllergyTypeEnum, { message: 'El tipo debe ser: MEDICATION, FOOD, ENVIRONMENTAL, OTHER' })
    type: AllergyTypeEnum;

    @ApiProperty({ enum: AllergySeverityEnum, example: 'SEVERE' })
    @IsNotEmpty({ message: 'La severidad es obligatoria' })
    @IsEnum(AllergySeverityEnum, { message: 'La severidad debe ser: MILD, MODERATE, SEVERE' })
    severity: AllergySeverityEnum;

    @ApiPropertyOptional({ example: 'Reacción anafiláctica conocida' })
    @IsOptional()
    @IsString({ message: 'Las notas deben ser texto' })
    @MaxLength(255, { message: 'Las notas no pueden exceder 255 caracteres' })
    notes?: string;
}
