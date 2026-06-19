// =============================================
// Seed - Datos iniciales del sistema GESAP
// Roles, usuario SUPER_AUDITOR, hospitales MSPAS Guatemala, pacientes de prueba
// Ejecutar con: npx ts-node prisma/seed.ts
// =============================================

import { PrismaClient, HospitalLevel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando seed de datos...');

    // ---- ROLES ----
    const roles = [
        {
            name: 'SUPER_AUDITOR',
            description: 'Acceso a TODOS los hospitales y datos del sistema completo. Gestión global.',
        },
        {
            name: 'AUDITOR',
            description: 'Acceso completo dentro de su hospital asignado. Gestión de usuarios, sesiones y auditoría.',
        },
        {
            name: 'DOCTOR',
            description: 'Consulta y modificación de pacientes dentro de su hospital y horario.',
        },
        {
            name: 'ASISTENTE_PREHOSPITALARIO',
            description: 'Va en la ambulancia. Registra evaluaciones XABCDE/SAMPLE y signos vitales en tiempo real. Asignado a una flota.',
        },
        {
            name: 'ASISTENTE_RECEPCION_CLINICA',
            description: 'Recibe alertas en el hospital. Monitorea datos en tiempo real. Prepara admisión.',
        },
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: { description: role.description },
            create: role,
        });
        console.log(`Rol upsert: ${role.name}`);
    }

    // Desactivar usuarios que tengan los roles eliminados (BOMBERO, PARAMEDICO, ENFERMERO)
    // Si esos roles aún existen en la BD, desactivar sus usuarios para no romper FK
    const rolesEliminados = ['BOMBERO', 'PARAMEDICO', 'ENFERMERO'];
    for (const roleName of rolesEliminados) {
        const rol = await prisma.role.findUnique({ where: { name: roleName } });
        if (rol) {
            const result = await prisma.user.updateMany({
                where: { roleId: rol.id, isActive: true },
                data: { isActive: false },
            });
            if (result.count > 0) {
                console.log(`Desactivados ${result.count} usuarios con rol ${roleName}`);
            }
            await prisma.role.update({ where: { id: rol.id }, data: { isActive: false } });
            console.log(`Rol ${roleName} desactivado`);
        }
    }

    // ---- HOSPITALES MSPAS GUATEMALA ----
    const hospitals: Array<{
        code: string;
        name: string;
        level: HospitalLevel;
        department: string;
        municipality: string;
    }> = [
        // --- Referencia Nacional ---
        { code: 'HSJD', name: 'Hospital General San Juan de Dios', level: HospitalLevel.REFERENCIA_NACIONAL, department: 'Guatemala', municipality: 'Guatemala' },
        { code: 'HROS', name: 'Hospital Roosevelt', level: HospitalLevel.REFERENCIA_NACIONAL, department: 'Guatemala', municipality: 'Guatemala' },

        // --- Especializados ---
        { code: 'HORT', name: 'Hospital Nacional de Ortopedia y Rehabilitación Dr. Jorge Von Ahn', level: HospitalLevel.ESPECIALIZADO, department: 'Guatemala', municipality: 'Guatemala' },
        { code: 'HMEN', name: 'Hospital Nacional de Salud Mental Dr. Carlos Federico Mora', level: HospitalLevel.ESPECIALIZADO, department: 'Guatemala', municipality: 'Guatemala' },
        { code: 'HINF', name: 'Hospital Infantil de Infectología y Rehabilitación', level: HospitalLevel.ESPECIALIZADO, department: 'Guatemala', municipality: 'Guatemala' },
        { code: 'HUNI', name: 'UNICAR - Unidad Nacional de Cirugía Cardiovascular', level: HospitalLevel.ESPECIALIZADO, department: 'Guatemala', municipality: 'Guatemala' },
        { code: 'HRES', name: 'Hospital de Referencia Nacional de Enfermedades Respiratorias', level: HospitalLevel.ESPECIALIZADO, department: 'Guatemala', municipality: 'Guatemala' },
        { code: 'HPBA', name: 'Hospital Nacional Pedro de Bethancourt', level: HospitalLevel.ESPECIALIZADO, department: 'Sacatepéquez', municipality: 'Antigua Guatemala' },
        { code: 'HAMJ', name: 'Hospital de la Amistad Japón-Guatemala', level: HospitalLevel.ESPECIALIZADO, department: 'Sacatepéquez', municipality: 'Antigua Guatemala' },

        // --- Regionales ---
        { code: 'HROC', name: 'Hospital Regional de Occidente', level: HospitalLevel.REGIONAL, department: 'Quetzaltenango', municipality: 'Quetzaltenango' },
        { code: 'HRCB', name: 'Hospital Regional de Cobán', level: HospitalLevel.REGIONAL, department: 'Alta Verapaz', municipality: 'Cobán' },
        { code: 'HRZA', name: 'Hospital Regional de Zacapa', level: HospitalLevel.REGIONAL, department: 'Zacapa', municipality: 'Zacapa' },
        { code: 'HREC', name: 'Hospital Regional de Escuintla', level: HospitalLevel.REGIONAL, department: 'Escuintla', municipality: 'Escuintla' },
        { code: 'HRCX', name: 'Hospital Regional de Cuilapa', level: HospitalLevel.REGIONAL, department: 'Santa Rosa', municipality: 'Cuilapa' },
        { code: 'HRSM', name: 'Hospital Regional de San Marcos', level: HospitalLevel.REGIONAL, department: 'San Marcos', municipality: 'San Marcos' },
        { code: 'HRHU', name: 'Hospital Regional de Huehuetenango Dr. Jorge Vides Molina', level: HospitalLevel.REGIONAL, department: 'Huehuetenango', municipality: 'Huehuetenango' },

        // --- Departamentales ---
        { code: 'HDAM', name: 'Hospital Departamental de Amatitlán', level: HospitalLevel.DEPARTAMENTAL, department: 'Guatemala', municipality: 'Amatitlán' },
        { code: 'HDSO', name: 'Hospital Departamental de Sololá', level: HospitalLevel.DEPARTAMENTAL, department: 'Sololá', municipality: 'Sololá' },
        { code: 'HDTO', name: 'Hospital Nacional de Totonicapán', level: HospitalLevel.DEPARTAMENTAL, department: 'Totonicapán', municipality: 'Totonicapán' },
        { code: 'HDCH', name: 'Hospital Nacional de Chimaltenango', level: HospitalLevel.DEPARTAMENTAL, department: 'Chimaltenango', municipality: 'Chimaltenango' },
        { code: 'HDJL', name: 'Hospital Nacional de Jalapa', level: HospitalLevel.DEPARTAMENTAL, department: 'Jalapa', municipality: 'Jalapa' },
        { code: 'HDJU', name: 'Hospital Nacional de Jutiapa', level: HospitalLevel.DEPARTAMENTAL, department: 'Jutiapa', municipality: 'Jutiapa' },
        { code: 'HDPR', name: 'Hospital Nacional de El Progreso Dr. Carlos Guillermo Méndez', level: HospitalLevel.DEPARTAMENTAL, department: 'El Progreso', municipality: 'Guastatoya' },
        { code: 'HDBV', name: 'Hospital Nacional de Salamá', level: HospitalLevel.DEPARTAMENTAL, department: 'Baja Verapaz', municipality: 'Salamá' },
        { code: 'HDIZ', name: 'Hospital Nacional Infantil Elisa Martínez', level: HospitalLevel.DEPARTAMENTAL, department: 'Izabal', municipality: 'Puerto Barrios' },
        { code: 'HDPE', name: 'Hospital Nacional de San Benito', level: HospitalLevel.DEPARTAMENTAL, department: 'Petén', municipality: 'San Benito' },
        { code: 'HDRE', name: 'Hospital Nacional de Retalhuleu', level: HospitalLevel.DEPARTAMENTAL, department: 'Retalhuleu', municipality: 'Retalhuleu' },
        { code: 'HDSM', name: 'Hospital Nacional de Mazatenango', level: HospitalLevel.DEPARTAMENTAL, department: 'Suchitepéquez', municipality: 'Mazatenango' },
        { code: 'HDSU', name: 'Hospital Nacional de Chiquimula', level: HospitalLevel.DEPARTAMENTAL, department: 'Chiquimula', municipality: 'Chiquimula' },
        { code: 'HDQU', name: 'Hospital Regional de El Quiché', level: HospitalLevel.DEPARTAMENTAL, department: 'Quiché', municipality: 'Santa Cruz del Quiché' },

        // --- Distritales ---
        { code: 'DDNE', name: 'Hospital Distrital de Nebaj', level: HospitalLevel.DISTRITAL, department: 'Quiché', municipality: 'Nebaj' },
        { code: 'DDJO', name: 'Hospital Distrital de Joyabaj', level: HospitalLevel.DISTRITAL, department: 'Quiché', municipality: 'Joyabaj' },
        { code: 'DDIX', name: 'Hospital Distrital de Ixcán', level: HospitalLevel.DISTRITAL, department: 'Quiché', municipality: 'Ixcán' },
        { code: 'DDSA', name: 'Hospital Distrital de Sayaxché', level: HospitalLevel.DISTRITAL, department: 'Petén', municipality: 'Sayaxché' },
        { code: 'DDMC', name: 'Hospital Distrital de Melchor de Mencos', level: HospitalLevel.DISTRITAL, department: 'Petén', municipality: 'Melchor de Mencos' },
        { code: 'DDPO', name: 'Hospital Distrital de Poptún', level: HospitalLevel.DISTRITAL, department: 'Petén', municipality: 'Poptún' },
        { code: 'DDTI', name: 'Hospital Distrital de Tiquisate', level: HospitalLevel.DISTRITAL, department: 'Escuintla', municipality: 'Tiquisate' },
        { code: 'DDCO', name: 'Hospital Distrital de Coatepeque', level: HospitalLevel.DISTRITAL, department: 'Quetzaltenango', municipality: 'Coatepeque' },
        { code: 'DDSP', name: 'Hospital Nacional de San Pedro Necta', level: HospitalLevel.DISTRITAL, department: 'Huehuetenango', municipality: 'San Pedro Necta' },
        { code: 'DDBA', name: 'Hospital Distrital de Barillas', level: HospitalLevel.DISTRITAL, department: 'Huehuetenango', municipality: 'Barillas' },
        { code: 'DDFR', name: 'Hospital Distrital de Fray Bartolomé de las Casas', level: HospitalLevel.DISTRITAL, department: 'Alta Verapaz', municipality: 'Fray Bartolomé de las Casas' },
        { code: 'DDMA', name: 'Hospital Distrital de Malacatán', level: HospitalLevel.DISTRITAL, department: 'San Marcos', municipality: 'Malacatán' },
        { code: 'DDCA', name: 'Hospital Distrital de Cuilco', level: HospitalLevel.DISTRITAL, department: 'Huehuetenango', municipality: 'Cuilco' },
    ];

    for (const hospital of hospitals) {
        await prisma.hospital.upsert({
            where: { code: hospital.code },
            update: { name: hospital.name, level: hospital.level },
            create: hospital,
        });
        console.log(`Hospital upsert: [${hospital.code}] ${hospital.name}`);
    }

    // ---- USUARIOS INICIALES ----
    const superAuditorRole = await prisma.role.findUnique({ where: { name: 'SUPER_AUDITOR' } });
    const auditorRole = await prisma.role.findUnique({ where: { name: 'AUDITOR' } });
    const doctorRole = await prisma.role.findUnique({ where: { name: 'DOCTOR' } });
    const hospitalSJD = await prisma.hospital.findUnique({ where: { code: 'HSJD' } });

    if (superAuditorRole) {
        const pwSuperAuditor = await bcrypt.hash('GESAP2026!', 10);
        await prisma.user.upsert({
            where: { email: 'superauditor@gesap.gt' },
            update: { password: pwSuperAuditor },
            create: {
                email: 'superauditor@gesap.gt',
                password: pwSuperAuditor,
                firstName: 'Super',
                lastName: 'Auditor',
                roleId: superAuditorRole.id,
                isActive: true,
            },
        });
        console.log('Usuario super auditor: superauditor@gesap.gt / GESAP2026!');
    }

    if (auditorRole && hospitalSJD) {
        const pwAuditor = await bcrypt.hash('GESAP2026!', 10);
        await prisma.user.upsert({
            where: { email: 'auditor@gesap.gt' },
            update: { password: pwAuditor },
            create: {
                email: 'auditor@gesap.gt',
                password: pwAuditor,
                firstName: 'Administrador',
                lastName: 'GESAP',
                roleId: auditorRole.id,
                hospitalId: hospitalSJD.id,
                isActive: true,
            },
        });
        console.log('Usuario auditor: auditor@gesap.gt / GESAP2026! (HSJD)');
    }

    if (doctorRole && hospitalSJD) {
        const pwDoctor = await bcrypt.hash('Doctor2026!', 10);
        await prisma.user.upsert({
            where: { email: 'dr.lopez@gesap.gt' },
            update: { password: pwDoctor },
            create: {
                email: 'dr.lopez@gesap.gt',
                password: pwDoctor,
                firstName: 'Carlos',
                lastName: 'Lopez',
                roleId: doctorRole.id,
                hospitalId: hospitalSJD.id,
                isActive: true,
            },
        });
        console.log('Usuario doctor: dr.lopez@gesap.gt / Doctor2026! (HSJD)');
    }

    // Asistente prehospitalario
    const preRole = await prisma.role.findUnique({ where: { name: 'ASISTENTE_PREHOSPITALARIO' } });
    if (preRole && hospitalSJD) {
        const pwPre = await bcrypt.hash('Asistente2026!', 12);
        await prisma.user.upsert({
            where: { email: 'asistente.pre@gesap.gt' },
            update: { password: pwPre },
            create: {
                email: 'asistente.pre@gesap.gt',
                password: pwPre,
                firstName: 'Roberto',
                lastName: 'Mendez',
                roleId: preRole.id,
                hospitalId: null,
                fleetId: 'FLOTA-01',
                isActive: true,
            },
        });
        console.log('Usuario asistente pre: asistente.pre@gesap.gt / Asistente2026! (FLOTA-01)');
    }

    // Asistente recepción clínica
    const recRole = await prisma.role.findUnique({ where: { name: 'ASISTENTE_RECEPCION_CLINICA' } });
    if (recRole && hospitalSJD) {
        const pwRec = await bcrypt.hash('Asistente2026!', 12);
        await prisma.user.upsert({
            where: { email: 'asistente.rec@gesap.gt' },
            update: { password: pwRec },
            create: {
                email: 'asistente.rec@gesap.gt',
                password: pwRec,
                firstName: 'Claudia',
                lastName: 'Ramirez',
                roleId: recRole.id,
                hospitalId: hospitalSJD.id,
                availabilityStatus: 'AVAILABLE',
                isActive: true,
            },
        });
        console.log('Usuario asistente rec: asistente.rec@gesap.gt / Asistente2026! (HSJD)');
    }

    // ---- 5 PACIENTES DE PRUEBA ----
    const patients = [
        {
            dpi: '2987654321001',
            firstName: 'Juan',
            secondName: 'Carlos',
            thirdName: null,
            firstLastName: 'Perez',
            secondLastName: 'Garcia',
            birthDate: new Date('1990-05-15'),
            sex: 'MASCULINO' as const,
            bloodType: 'O_POSITIVO' as const,
            phone: '55123456',
            address: 'Zona 1, Ciudad de Guatemala',
        },
        {
            dpi: '3012345678002',
            firstName: 'Maria',
            secondName: 'Fernanda',
            thirdName: null,
            firstLastName: 'Lopez',
            secondLastName: 'Martinez',
            birthDate: new Date('1985-11-20'),
            sex: 'FEMENINO' as const,
            bloodType: 'A_POSITIVO' as const,
            phone: '44112233',
            address: 'Zona 10, Ciudad de Guatemala',
        },
        {
            dpi: '2765432109003',
            firstName: 'Pedro',
            secondName: null,
            thirdName: null,
            firstLastName: 'Ramirez',
            secondLastName: 'Hernandez',
            birthDate: new Date('1978-03-08'),
            sex: 'MASCULINO' as const,
            bloodType: 'B_NEGATIVO' as const,
            phone: '55998877',
            address: 'Zona 5, Mixco',
        },
        {
            dpi: '3198765432004',
            firstName: 'Ana',
            secondName: 'Lucia',
            thirdName: 'Isabel',
            firstLastName: 'Morales',
            secondLastName: 'Castillo',
            birthDate: new Date('1995-07-22'),
            sex: 'FEMENINO' as const,
            bloodType: 'AB_POSITIVO' as const,
            phone: '33445566',
            address: 'Zona 15, Ciudad de Guatemala',
        },
        {
            dpi: '2654321098005',
            firstName: 'Diego',
            secondName: 'Alejandro',
            thirdName: null,
            firstLastName: 'Santos',
            secondLastName: 'Mejia',
            birthDate: new Date('2000-12-01'),
            sex: 'MASCULINO' as const,
            bloodType: 'O_NEGATIVO' as const,
            phone: '55667788',
            address: 'Zona 7, Ciudad de Guatemala',
        },
    ];

    for (const patient of patients) {
        await prisma.patient.upsert({
            where: { dpi: patient.dpi },
            update: {},
            create: patient,
        });
        console.log(`Paciente upsert: ${patient.firstName} ${patient.firstLastName} (${patient.dpi})`);
    }

    console.log('\nSeed completado exitosamente');
}

main()
    .catch((e) => {
        console.error('Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
