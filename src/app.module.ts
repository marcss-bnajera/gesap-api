// =============================================
// Modulo principal de la aplicacion
// Importa todos los modulos del sistema
// =============================================

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { EmergenciesModule } from './modules/emergencies/emergencies.module';
import { UnidentifiedPatientsModule } from './modules/unidentified-patients/unidentified-patients.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        RolesModule,
        UsersModule,
        PatientsModule,
        EmergenciesModule,
        UnidentifiedPatientsModule,
        HospitalsModule,
    ],
    providers: [
        { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    ],
})
export class AppModule {}
