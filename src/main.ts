// =============================================
// GESAP API - Punto de entrada
// Configura el servidor NestJS en el puerto 3000
// Prefijo global: /gesap/v1
// =============================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Prefijo global para todas las rutas: /gesap/v1/...
    app.setGlobalPrefix('gesap/v1');

    // Pipe global de validacion
    // Usa los decoradores de class-validator en los DTOs
    // whitelist: elimina campos que no esten definidos en el DTO
    // forbidNonWhitelisted: lanza error si mandan campos extra
    // transform: convierte los tipos automaticamente (string a number, etc.)
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Habilitar CORS para el portal de pacientes
    app.enableCors({
        origin: ['http://localhost:3002'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });

    const swaggerConfig = new DocumentBuilder()
        .setTitle('GESAP API')
        .setDescription('API principal del Sistema de Gestión de Atención a Pacientes (MSPAS Guatemala). Gestiona pacientes, usuarios, emergencias, roles y más.')
        .setVersion('1.0')
        .addBearerAuth(
            { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
            'JWT',
        )
        .addTag('Auth', 'Autenticación y perfil')
        .addTag('Users', 'Gestión de usuarios del sistema')
        .addTag('Roles', 'Gestión de roles')
        .addTag('Patients', 'Gestión de pacientes')
        .addTag('Emergencies', 'Gestión de emergencias prehospitalarias')
        .addTag('Unidentified Patients', 'Pacientes sin identificar')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('gesap/v1/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`GESAP API ejecutandose en http://localhost:${port}/gesap/v1`);
    console.log(`Swagger disponible en http://localhost:${port}/gesap/v1/docs`);
}

bootstrap();