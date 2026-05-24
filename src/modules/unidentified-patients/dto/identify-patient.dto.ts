import { IsNotEmpty, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdentifyPatientDto {
    @ApiProperty({ example: 1, description: 'ID del paciente identificado en el sistema que corresponde al paciente sin identificar' })
    @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
    @IsInt()
    @Min(1)
    patientId: number;
}
