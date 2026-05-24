import { IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteEmergencyDto {
    @ApiProperty({
        example: { outcome: 'estable', handoff_to: 'Dr. López', notes: 'Paciente entregado en urgencias', vital_signs_on_arrival: { pulse: 80, bp: '130/85' } },
        description: 'Registro de cierre de la emergencia (JSON libre). Debe incluir al menos el estado del paciente al completar.',
    })
    @IsNotEmpty({ message: 'El registro de cierre es obligatorio' })
    @IsObject({ message: 'El registro de cierre debe ser un objeto JSON' })
    completionRecord: Record<string, unknown>;
}
