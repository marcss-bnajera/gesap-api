import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmergencyStatus } from '@prisma/client';

export class FilterEmergenciesDto {
    @ApiPropertyOptional({ enum: EmergencyStatus, example: 'PENDING', description: 'Filtrar por estado de la emergencia' })
    @IsOptional()
    @IsEnum(EmergencyStatus, { message: 'Estado invalido' })
    status?: EmergencyStatus;

    @ApiPropertyOptional({ example: 1, description: 'Filtrar por hospital (solo SUPER_AUDITOR puede usar cualquier hospitalId)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    hospitalId?: number;
}
