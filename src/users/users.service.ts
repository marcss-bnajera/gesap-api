// =============================================
// UsersService
// CRUD de usuarios + toggle active + cambiar contrasena
// Filtrado por hospital: AUDITOR ve solo su hospital, SUPER_AUDITOR ve todo
// =============================================

import {
    Injectable, NotFoundException, ConflictException,
    BadRequestException, ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';
import { getHospitalScope, HospitalScopedUser } from '../common/helpers/hospital-scope.helper';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto, currentUser: HospitalScopedUser) {
        const exists = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (exists) {
            throw new ConflictException('Ya existe un usuario con ese correo');
        }

        const role = await this.prisma.role.findUnique({
            where: { id: createUserDto.roleId },
        });

        if (!role) {
            throw new NotFoundException(`No existe el rol con ID ${createUserDto.roleId}`);
        }

        // AUDITOR solo puede crear usuarios en su propio hospital
        const hospitalId = currentUser.roleName === 'SUPER_AUDITOR'
            ? createUserDto.hospitalId
            : currentUser.hospitalId ?? undefined;

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
                hospitalId,
            },
            include: { role: true, hospital: { select: { id: true, code: true, name: true } } },
        });

        const { password, ...result } = user;
        return result;
    }

    async findAll(currentUser: HospitalScopedUser) {
        const scope = getHospitalScope(currentUser);

        const users = await this.prisma.user.findMany({
            where: scope,
            include: {
                role: { select: { id: true, name: true } },
                hospital: { select: { id: true, code: true, name: true } },
            },
            orderBy: { id: 'asc' },
        });

        return users.map(({ password, ...user }) => user);
    }

    async findOne(id: number, currentUser: HospitalScopedUser) {
        const scope = getHospitalScope(currentUser);

        const user = await this.prisma.user.findFirst({
            where: { id, ...scope },
            include: {
                role: true,
                hospital: { select: { id: true, code: true, name: true } },
            },
        });

        if (!user) {
            throw new NotFoundException(`No se encontró el usuario con ID ${id}`);
        }

        const { password, ...result } = user;
        return result;
    }

    async update(id: number, updateUserDto: UpdateUserDto, currentUser: HospitalScopedUser) {
        await this.findOne(id, currentUser);

        if (updateUserDto.email) {
            const emailInUse = await this.prisma.user.findFirst({
                where: { email: updateUserDto.email, NOT: { id } },
            });

            if (emailInUse) {
                throw new ConflictException('Ese correo ya está registrado por otro usuario');
            }
        }

        // AUDITOR no puede mover usuarios a otro hospital
        if (currentUser.roleName !== 'SUPER_AUDITOR' && updateUserDto.hospitalId !== undefined) {
            if (updateUserDto.hospitalId !== currentUser.hospitalId) {
                throw new ForbiddenException('No puede reasignar usuarios a otro hospital');
            }
        }

        const user = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            include: {
                role: true,
                hospital: { select: { id: true, code: true, name: true } },
            },
        });

        const { password, ...result } = user;
        return result;
    }

    async toggleActive(id: number, currentUser: HospitalScopedUser & { id: number }) {
        if (currentUser.id === id) {
            throw new ForbiddenException('No puedes desactivarte a ti mismo');
        }

        const target = await this.findOne(id, currentUser) as { role: { name: string }; isActive: boolean };

        if (currentUser.roleName === 'AUDITOR') {
            const protectedRoles = ['AUDITOR', 'SUPER_AUDITOR'];
            if (protectedRoles.includes(target.role.name)) {
                throw new ForbiddenException('No tienes permisos para modificar a este usuario');
            }
        }

        const updated = await this.prisma.user.update({
            where: { id },
            data: { isActive: !target.isActive },
        });

        return {
            message: updated.isActive ? 'Usuario activado' : 'Usuario desactivado',
            isActive: updated.isActive,
        };
    }

    async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException(`No se encontró el usuario con ID ${id}`);
        }

        const isValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);

        if (!isValid) {
            throw new BadRequestException('La contraseña actual es incorrecta');
        }

        const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

        await this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });

        return { message: 'Contraseña actualizada correctamente' };
    }
}
