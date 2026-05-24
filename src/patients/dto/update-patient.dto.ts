import {
    IsOptional, IsString, IsEnum, IsDateString,
    MinLength, MaxLength, Matches, Length,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SexEnum, BloodTypeEnum } from './create-patient.dto';

export class UpdatePatientDto {
    @ApiPropertyOptional({ example: 'Juan' })
    @IsOptional()
    @IsString({ message: 'El primer nombre debe ser texto' })
    @MinLength(2, { message: 'Minimo 2 caracteres' })
    @MaxLength(50, { message: 'Maximo 50 caracteres' })
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'Solo letras' })
    firstName?: string;

    @ApiPropertyOptional({ example: 'Carlos' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'Solo letras' })
    secondName?: string;

    @ApiPropertyOptional({ example: 'Antonio' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'Solo letras' })
    thirdName?: string;

    @ApiPropertyOptional({ example: 'García' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'Solo letras' })
    firstLastName?: string;

    @ApiPropertyOptional({ example: 'Pérez' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { message: 'Solo letras' })
    secondLastName?: string;

    @ApiPropertyOptional({ example: '1990-05-15', description: 'Formato: YYYY-MM-DD' })
    @IsOptional()
    @IsDateString({}, { message: 'Formato: YYYY-MM-DD' })
    birthDate?: string;

    @ApiPropertyOptional({ enum: SexEnum, example: 'MASCULINO' })
    @IsOptional()
    @IsEnum(SexEnum, { message: 'Debe ser MASCULINO o FEMENINO' })
    sex?: SexEnum;

    @ApiPropertyOptional({ enum: BloodTypeEnum, example: 'O_POSITIVO' })
    @IsOptional()
    @IsEnum(BloodTypeEnum, { message: 'Tipo de sangre invalido' })
    bloodType?: BloodTypeEnum;

    @ApiPropertyOptional({ example: '55551234', description: '8 dígitos exactos' })
    @IsOptional()
    @IsString()
    @Length(8, 8, { message: 'El telefono debe tener 8 digitos' })
    @Matches(/^\d{8}$/)
    phone?: string;

    @ApiPropertyOptional({ example: 'Zona 12, Ciudad de Guatemala' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    address?: string;
}
