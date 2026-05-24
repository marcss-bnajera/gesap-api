import {
    IsOptional, IsEmail, IsString, IsInt, IsEnum,
    MinLength, MaxLength, Matches, Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AvailabilityStatus } from '@prisma/client';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'nuevo.email@gesap.gt' })
    @IsOptional()
    @IsEmail({}, { message: 'El correo debe tener formato valido' })
    @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
    email?: string;

    @ApiPropertyOptional({ example: 'Carlos' })
    @IsOptional()
    @IsString({ message: 'El nombre debe ser texto' })
    @MinLength(2, { message: 'El nombre debe tener minimo 2 caracteres' })
    @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
    firstName?: string;

    @ApiPropertyOptional({ example: 'López' })
    @IsOptional()
    @IsString({ message: 'El apellido debe ser texto' })
    @MinLength(2, { message: 'El apellido debe tener minimo 2 caracteres' })
    @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'El apellido solo puede contener letras y espacios' })
    lastName?: string;

    @ApiPropertyOptional({ example: 3, description: 'ID del rol' })
    @IsOptional()
    @IsInt({ message: 'El ID del rol debe ser un numero entero' })
    @Min(1, { message: 'El ID del rol debe ser mayor a 0' })
    roleId?: number;

    @ApiPropertyOptional({ example: 1, description: 'ID del hospital' })
    @IsOptional()
    @IsInt({ message: 'El ID del hospital debe ser un numero entero' })
    @Min(1)
    hospitalId?: number;

    @ApiPropertyOptional({ example: 'FLOTA-01' })
    @IsOptional()
    @IsString()
    @MaxLength(50, { message: 'El ID de flota no puede exceder 50 caracteres' })
    fleetId?: string;

    @ApiPropertyOptional({ enum: AvailabilityStatus, example: 'AVAILABLE' })
    @IsOptional()
    @IsEnum(AvailabilityStatus, { message: 'Estado de disponibilidad invalido' })
    availabilityStatus?: AvailabilityStatus;
}

export class ChangePasswordDto {
    @ApiPropertyOptional({ example: 'OldPass123!' })
    @IsString({ message: 'La contrasena actual es obligatoria' })
    currentPassword: string;

    @ApiPropertyOptional({ example: 'NewPass456!' })
    @IsString({ message: 'La nueva contrasena debe ser texto' })
    @MinLength(8, { message: 'La nueva contrasena debe tener minimo 8 caracteres' })
    @MaxLength(50, { message: 'La nueva contrasena no puede exceder 50 caracteres' })
    @Matches(/[A-Z]/, { message: 'La nueva contrasena debe tener al menos una mayuscula' })
    @Matches(/[a-z]/, { message: 'La nueva contrasena debe tener al menos una minuscula' })
    @Matches(/[0-9]/, { message: 'La nueva contrasena debe tener al menos un numero' })
    @Matches(/[!@#$%^&*]/, { message: 'La nueva contrasena debe tener un caracter especial (!@#$%^&*)' })
    newPassword: string;
}
