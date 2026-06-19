import {
    Controller, Get, Post, Put, Patch, Delete,
    Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HospitalScopedUser } from '../common/helpers/hospital-scope.helper';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @ApiOperation({ summary: 'Crear usuario', description: 'AUDITOR: solo crea usuarios para su hospital. SUPER_AUDITOR: crea para cualquier hospital.' })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 409, description: 'El correo ya existe' })
    @Post()
    @Roles('AUDITOR', 'SUPER_AUDITOR')
    create(
        @CurrentUser() currentUser: HospitalScopedUser,
        @Body() createUserDto: CreateUserDto,
    ) {
        return this.usersService.create(createUserDto, currentUser);
    }

    @ApiOperation({ summary: 'Listar usuarios', description: 'AUDITOR: retorna solo usuarios de su hospital. SUPER_AUDITOR: retorna todos.' })
    @ApiResponse({ status: 200, description: 'Lista de usuarios' })
    @Get()
    @Roles('AUDITOR', 'SUPER_AUDITOR')
    findAll(@CurrentUser() currentUser: HospitalScopedUser) {
        return this.usersService.findAll(currentUser);
    }

    @ApiOperation({ summary: 'Obtener usuario por ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Datos del usuario' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado o fuera del scope del AUDITOR' })
    @Get(':id')
    @Roles('AUDITOR', 'SUPER_AUDITOR')
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() currentUser: HospitalScopedUser,
    ) {
        return this.usersService.findOne(id, currentUser);
    }

    @ApiOperation({ summary: 'Actualizar usuario' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Usuario actualizado' })
    @Put(':id')
    @Roles('AUDITOR', 'SUPER_AUDITOR')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser() currentUser: HospitalScopedUser,
    ) {
        return this.usersService.update(id, updateUserDto, currentUser);
    }

    @ApiOperation({ summary: 'Activar / desactivar usuario', description: 'Alterna el campo isActive del usuario.' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Estado del usuario cambiado' })
    @Patch(':id/toggle-active')
    @Roles('AUDITOR', 'SUPER_AUDITOR')
    toggleActive(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() currentUser: HospitalScopedUser & { id: number },
    ) {
        return this.usersService.toggleActive(id, currentUser);
    }

    @ApiOperation({ summary: 'Cambiar contraseña del usuario' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
    @Patch(':id/change-password')
    @Roles('AUDITOR', 'SUPER_AUDITOR')
    changePassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        return this.usersService.changePassword(id, changePasswordDto);
    }
}
