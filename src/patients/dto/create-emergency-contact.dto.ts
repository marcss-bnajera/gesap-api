import {
    IsNotEmpty, IsString, IsOptional, IsInt,
    MaxLength, Length, Matches, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmergencyContactDto {
    @ApiProperty({ example: 1, description: 'ID del paciente' })
    @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
    @IsInt({ message: 'El ID del paciente debe ser un numero entero' })
    @Min(1, { message: 'El ID del paciente debe ser mayor a 0' })
    patientId: number;

    @ApiProperty({ example: 'María García', description: 'Nombre completo del contacto' })
    @IsNotEmpty({ message: 'El nombre completo del contacto es obligatorio' })
    @IsString({ message: 'El nombre debe ser texto' })
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    fullName: string;

    @ApiProperty({ example: '55559999', description: 'Teléfono del contacto (8 dígitos)' })
    @IsNotEmpty({ message: 'El telefono del contacto es obligatorio' })
    @IsString({ message: 'El telefono debe ser texto' })
    @Length(8, 8, { message: 'El telefono debe tener exactamente 8 digitos' })
    @Matches(/^\d{8}$/, { message: 'El telefono solo puede contener numeros (8 digitos)' })
    phone: string;

    @ApiPropertyOptional({ example: 'Madre', description: 'Relación con el paciente' })
    @IsOptional()
    @IsString({ message: 'La relacion debe ser texto' })
    @MaxLength(50, { message: 'La relacion no puede exceder 50 caracteres' })
    relationship?: string;
}

export class UpdateEmergencyContactDto {
    @ApiPropertyOptional({ example: 'María García' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    fullName?: string;

    @ApiPropertyOptional({ example: '55559999', description: '8 dígitos exactos' })
    @IsOptional()
    @IsString()
    @Length(8, 8, { message: 'El telefono debe tener 8 digitos' })
    @Matches(/^\d{8}$/, { message: 'Solo numeros' })
    phone?: string;

    @ApiPropertyOptional({ example: 'Padre' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    relationship?: string;
}
