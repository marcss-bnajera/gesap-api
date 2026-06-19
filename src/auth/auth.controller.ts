import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @ApiOperation({ summary: 'Iniciar sesión', description: 'Retorna el JWT token para autenticar las siguientes peticiones.' })
    @ApiResponse({ status: 200, description: 'Login exitoso — retorna access_token' })
    @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
    @Post('login')
    login(@Body() loginDto: LoginDto, @Req() req: Request) {
        return this.authService.login(loginDto, req);
    }

    @ApiOperation({ summary: 'Ver perfil autenticado', description: 'Retorna los datos del usuario autenticado según el JWT.' })
    @ApiResponse({ status: 200, description: 'Perfil del usuario' })
    @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
    @ApiBearerAuth('JWT')
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@CurrentUser('id') userId: number) {
        return this.authService.getProfile(userId);
    }
}
