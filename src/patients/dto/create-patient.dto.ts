import {
    IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString,
    MinLength, MaxLength, Matches, Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SexEnum {
    MASCULINO = 'MASCULINO',
    FEMENINO = 'FEMENINO',
}

export enum BloodTypeEnum {
    A_POSITIVO = 'A_POSITIVO',
    A_NEGATIVO = 'A_NEGATIVO',
    B_POSITIVO = 'B_POSITIVO',
    B_NEGATIVO = 'B_NEGATIVO',
    AB_POSITIVO = 'AB_POSITIVO',
    AB_NEGATIVO = 'AB_NEGATIVO',
    O_POSITIVO = 'O_POSITIVO',
    O_NEGATIVO = 'O_NEGATIVO',
}

export class CreatePatientDto {
    @ApiProperty({ example: '2893459812345', description: 'DPI del paciente (13 dígitos exactos)' })
    @IsNotEmpty({ message: 'El DPI es obligatorio' })
    @IsString({ message: 'El DPI debe ser texto' })
    @Length(13, 13, { message: 'El DPI debe tener exactamente 13 digitos' })
    @Matches(/^\d{13}$/, { message: 'El DPI solo puede contener numeros (13 digitos)' })
    dpi: string;

    @ApiProperty({ example: 'Juan', description: 'Primer nombre del paciente' })
    @IsNotEmpty({ message: 'El primer nombre es obligatorio' })
    @IsString({ message: 'El primer nombre debe ser texto' })
    @MinLength(2, { message: 'El primer nombre debe tener minimo 2 caracteres' })
    @MaxLength(50, { message: 'El primer nombre no puede exceder 50 caracteres' })
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'El primer nombre solo puede contener letras' })
    firstName: string;

    @ApiPropertyOptional({ example: 'Carlos', description: 'Segundo nombre (opcional)' })
    @IsOptional()
    @IsString({ message: 'El segundo nombre debe ser texto' })
    @MinLength(2, { message: 'El segundo nombre debe tener minimo 2 caracteres' })
    @MaxLength(50, { message: 'El segundo nombre no puede exceder 50 caracteres' })
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'El segundo nombre solo puede contener letras' })
    secondName?: string;

    @ApiPropertyOptional({ example: 'Antonio', description: 'Tercer nombre (opcional)' })
    @IsOptional()
    @IsString({ message: 'El tercer nombre debe ser texto' })
    @MinLength(2, { message: 'El tercer nombre debe tener minimo 2 caracteres' })
    @MaxLength(50, { message: 'El tercer nombre no puede exceder 50 caracteres' })
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'El tercer nombre solo puede contener letras' })
    thirdName?: string;

    @ApiProperty({ example: 'García', description: 'Primer apellido del paciente' })
    @IsNotEmpty({ message: 'El primer apellido es obligatorio' })
    @IsString({ message: 'El primer apellido debe ser texto' })
    @MinLength(2, { message: 'El primer apellido debe tener minimo 2 caracteres' })
    @MaxLength(50, { message: 'El primer apellido no puede exceder 50 caracteres' })
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'El primer apellido solo puede contener letras' })
    firstLastName: string;

    @ApiProperty({ example: 'Pérez', description: 'Segundo apellido del paciente' })
    @IsNotEmpty({ message: 'El segundo apellido es obligatorio' })
    @IsString({ message: 'El segundo apellido debe ser texto' })
    @MinLength(2, { message: 'El segundo apellido debe tener minimo 2 caracteres' })
    @MaxLength(50, { message: 'El segundo apellido no puede exceder 50 caracteres' })
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'El segundo apellido solo puede contener letras' })
    secondLastName: string;

    @ApiProperty({ example: '1990-05-15', description: 'Fecha de nacimiento (YYYY-MM-DD)' })
    @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
    @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
    birthDate: string;

    @ApiProperty({ enum: SexEnum, example: 'MASCULINO' })
    @IsNotEmpty({ message: 'El sexo es obligatorio' })
    @IsEnum(SexEnum, { message: 'El sexo debe ser MASCULINO o FEMENINO' })
    sex: SexEnum;

    @ApiPropertyOptional({ enum: BloodTypeEnum, example: 'O_POSITIVO' })
    @IsOptional()
    @IsEnum(BloodTypeEnum, {
        message: 'Tipo de sangre: A_POSITIVO, A_NEGATIVO, B_POSITIVO, B_NEGATIVO, AB_POSITIVO, AB_NEGATIVO, O_POSITIVO, O_NEGATIVO',
    })
    bloodType?: BloodTypeEnum;

    @ApiPropertyOptional({ example: '55551234', description: 'Teléfono (8 dígitos exactos)' })
    @IsOptional()
    @IsString({ message: 'El telefono debe ser texto' })
    @Length(8, 8, { message: 'El telefono debe tener exactamente 8 digitos' })
    @Matches(/^\d{8}$/, { message: 'El telefono solo puede contener numeros (8 digitos)' })
    phone?: string;

    @ApiPropertyOptional({ example: 'Zona 12, Ciudad de Guatemala', description: 'Dirección del paciente' })
    @IsOptional()
    @IsString({ message: 'La direccion debe ser texto' })
    @MaxLength(255, { message: 'La direccion no puede exceder 255 caracteres' })
    address?: string;
}
