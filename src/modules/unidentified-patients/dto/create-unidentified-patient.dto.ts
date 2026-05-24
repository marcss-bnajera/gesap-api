import {
    IsNotEmpty, IsOptional, IsEnum, IsInt, IsString,
    IsDateString, MaxLength, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sex } from '@prisma/client';

export class CreateUnidentifiedPatientDto {
    @ApiPropertyOptional({ example: 35, description: 'Edad estimada del paciente' })
    @IsOptional()
    @IsInt()
    @Min(0)
    estimatedAge?: number;

    @ApiProperty({ enum: Sex, example: 'MASCULINO', description: 'Sexo del paciente' })
    @IsNotEmpty({ message: 'El sexo es obligatorio' })
    @IsEnum(Sex, { message: 'Sexo invalido: MASCULINO o FEMENINO' })
    sex: Sex;

    @ApiPropertyOptional({ example: 'Gorra roja con logo blanco' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    hatDescription?: string;

    @ApiPropertyOptional({ example: 'Cabello negro corto, cicatriz en mejilla izquierda' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    headFaceDescription?: string;

    @ApiPropertyOptional({ example: 'Camisa azul manga larga' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    shirtDescription?: string;

    @ApiPropertyOptional({ example: 'Chaqueta negra de cuero' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    jacketDescription?: string;

    @ApiPropertyOptional({ example: 'Pantalón gris de mezclilla' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    pantsDescription?: string;

    @ApiPropertyOptional({ example: 'Tenis blancos marca Nike' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    shoesDescription?: string;

    @ApiPropertyOptional({ example: 'Tatuaje en brazo derecho con diseño de flor' })
    @IsOptional()
    @IsString()
    additionalNotes?: string;

    @ApiProperty({ example: 1, description: 'ID del hospital donde se traslada al paciente' })
    @IsNotEmpty({ message: 'El hospital destino es obligatorio' })
    @IsInt()
    @Min(1)
    hospitalId: number;

    @ApiProperty({ example: '2024-06-15T14:30:00.000Z', description: 'Fecha y hora del traslado (ISO 8601)' })
    @IsNotEmpty({ message: 'La fecha de traslado es obligatoria' })
    @IsDateString({}, { message: 'Fecha de traslado debe ser ISO 8601' })
    transferDate: string;
}
