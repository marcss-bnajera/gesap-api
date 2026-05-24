import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'dr.lopez@gesap.gt', description: 'Correo electrónico del usuario' })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'El correo debe tener formato valido (ejemplo@dominio.com)' })
    @MaxLength(100, { message: 'El correo no puede tener mas de 100 caracteres' })
    email: string;

    @ApiProperty({ example: 'Doctor2024!', description: 'Contraseña del usuario' })
    @IsNotEmpty({ message: 'La contrasena es obligatoria' })
    @IsString({ message: 'La contrasena debe ser texto' })
    password: string;
}
