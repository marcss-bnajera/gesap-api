import {
    IsNotEmpty, IsString, IsOptional, IsInt, IsDateString,
    MinLength, MaxLength, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTreatmentDto {
    @ApiProperty({ example: 1, description: 'ID del paciente' })
    @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
    @IsInt({ message: 'El ID del paciente debe ser un numero entero' })
    @Min(1, { message: 'El ID del paciente debe ser mayor a 0' })
    patientId: number;

    @ApiProperty({ example: 'Metformina 500mg', description: 'Nombre del tratamiento' })
    @IsNotEmpty({ message: 'El nombre del tratamiento es obligatorio' })
    @IsString({ message: 'El nombre del tratamiento debe ser texto' })
    @MinLength(3, { message: 'El nombre debe tener minimo 3 caracteres' })
    @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
    name: string;

    @ApiPropertyOptional({ example: 'Una tableta cada 12 horas con alimentos' })
    @IsOptional()
    @IsString({ message: 'La descripcion debe ser texto' })
    description?: string;

    @ApiProperty({ example: '2024-01-15', description: 'Fecha de inicio del tratamiento (YYYY-MM-DD)' })
    @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
    @IsDateString({}, { message: 'La fecha de inicio debe tener formato YYYY-MM-DD' })
    startDate: string;

    @ApiPropertyOptional({ example: '2024-07-15', description: 'Fecha de fin estimada (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de fin debe tener formato YYYY-MM-DD' })
    endDate?: string;
}
