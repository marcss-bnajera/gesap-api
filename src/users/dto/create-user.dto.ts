import {
    IsNotEmpty, IsEmail, IsString, IsInt, IsOptional, IsEnum,
    MinLength, MaxLength, Matches, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AvailabilityStatus } from '@prisma/client';

export class CreateUserDto {
    @ApiProperty({ example: 'nuevo.doctor@gesap.gt', description: 'Correo electrónico del usuario' })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo debe tener formato valido (ej: usuario@gesap.gt)' })
    @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
    email: string;

    @ApiProperty({ example: 'Doctor2024!', description: 'Contraseña (mín. 8 chars, mayúscula, minúscula, número, especial)' })
    @IsNotEmpty({ message: 'La contrasena es obligatoria' })
    @IsString({ message: 'La contrasena debe ser texto' })
    @MinLength(8, { message: 'La contrasena debe tener minimo 8 caracteres' })
    @MaxLength(50, { message: 'La contrasena no puede exceder 50 caracteres' })
    @Matches(/[A-Z]/, { message: 'La contrasena debe tener al menos una mayuscula' })
    @Matches(/[a-z]/, { message: 'La contrasena debe tener al menos una minuscula' })
    @Matches(/[0-9]/, { message: 'La contrasena debe tener al menos un numero' })
    @Matches(/[!@#$%^&*]/, { message: 'La contrasena debe tener al menos un caracter especial (!@#$%^&*)' })
    password: string;

    @ApiProperty({ example: 'Carlos', description: 'Nombre del usuario' })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString({ message: 'El nombre debe ser texto' })
    @MinLength(2, { message: 'El nombre debe tener minimo 2 caracteres' })
    @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
    firstName: string;

    @ApiProperty({ example: 'López', description: 'Apellido del usuario' })
    @IsNotEmpty({ message: 'El apellido es obligatorio' })
    @IsString({ message: 'El apellido debe ser texto' })
    @MinLength(2, { message: 'El apellido debe tener minimo 2 caracteres' })
    @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'El apellido solo puede contener letras y espacios' })
    lastName: string;

    @ApiProperty({ example: 3, description: 'ID del rol asignado al usuario' })
    @IsNotEmpty({ message: 'El ID del rol es obligatorio' })
    @IsInt({ message: 'El ID del rol debe ser un numero entero' })
    @Min(1, { message: 'El ID del rol debe ser mayor a 0' })
    roleId: number;

    @ApiPropertyOptional({ example: 1, description: 'ID del hospital (obligatorio para DOCTOR, AUDITOR, ASISTENTE_RECEPCION_CLINICA)' })
    @IsOptional()
    @IsInt({ message: 'El ID del hospital debe ser un numero entero' })
    @Min(1)
    hospitalId?: number;

    @ApiPropertyOptional({ example: 'FLOTA-01', description: 'ID de flota (obligatorio para ASISTENTE_PREHOSPITALARIO)' })
    @IsOptional()
    @IsString()
    @MaxLength(50, { message: 'El ID de flota no puede exceder 50 caracteres' })
    fleetId?: string;

    @ApiPropertyOptional({ enum: AvailabilityStatus, example: 'AVAILABLE', description: 'Estado de disponibilidad (para ASISTENTE_RECEPCION_CLINICA)' })
    @IsOptional()
    @IsEnum(AvailabilityStatus, { message: 'Estado de disponibilidad invalido' })
    availabilityStatus?: AvailabilityStatus;
}
