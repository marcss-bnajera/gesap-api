import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth('JWT')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('AUDITOR', 'SUPER_AUDITOR')
export class RolesController {
    constructor(private rolesService: RolesService) { }

    @ApiOperation({ summary: 'Crear rol', description: 'Crea un nuevo rol en el sistema.' })
    @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
    @Post()
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @ApiOperation({ summary: 'Listar roles', description: 'Retorna todos los roles activos del sistema.' })
    @ApiResponse({ status: 200, description: 'Lista de roles' })
    @Get()
    findAll() {
        return this.rolesService.findAll();
    }

    @ApiOperation({ summary: 'Obtener rol por ID' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del rol' })
    @ApiResponse({ status: 200, description: 'Datos del rol' })
    @ApiResponse({ status: 404, description: 'Rol no encontrado' })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.findOne(id);
    }

    @ApiOperation({ summary: 'Actualizar rol' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Rol actualizado' })
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
        return this.rolesService.update(id, updateRoleDto);
    }

    @ApiOperation({ summary: 'Eliminar rol' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Rol eliminado' })
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.remove(id);
    }
}
