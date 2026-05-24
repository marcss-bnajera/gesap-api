// =============================================
// Modulo principal de la aplicacion
// Importa todos los modulos del sistema
// =============================================

import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { EmergenciesModule } from './modules/emergencies/emergencies.module';
import { UnidentifiedPatientsModule } from './modules/unidentified-patients/unidentified-patients.module';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        RolesModule,
        UsersModule,
        PatientsModule,
        EmergenciesModule,
        UnidentifiedPatientsModule,
    ],
})
export class AppModule {}
