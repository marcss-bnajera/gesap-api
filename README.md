# gesap-api

API principal del Sistema de Gestión de Atención a Pacientes (GESAP) del MSPAS Guatemala. Gestiona usuarios, pacientes, expedientes, emergencias y eventos en tiempo real.

## Stack

- NestJS + TypeScript
- Prisma ORM + PostgreSQL
- JWT (passport-jwt)
- Socket.IO (WebSocket `/user-events`, path `/api-ws`)
- Swagger (documentación interactiva)

## Puertos

| Entorno | Puerto |
|---------|--------|
| Desarrollo | `3000` |
| Docker (host) | `3100` |

**Prefix global:** `/gesap/v1`  
**Swagger:** `http://localhost:3000/gesap/v1/docs`

## Variables de entorno

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:admin@localhost:5433/gesap_db?schema=public"
JWT_SECRET=x7K9mP2vQ8nR4wL6jH3cF1bA5dY0uT8sE2gN6iO9pX4zM7kJ5r
JWT_EXPIRES_IN=24h
```

## Instalación y desarrollo

```bash
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy

# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Seed (usuarios de prueba)

```bash
# Requiere DATABASE_URL apuntando a la BD (local o Docker en :5433)
DATABASE_URL="postgresql://postgres:admin@localhost:5433/gesap_db?schema=public" \
  npx ts-node prisma/seed.ts
```

Usuarios creados por el seed:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `superauditor@gesap.gt` | `GESAP2026!` | SUPER_AUDITOR |
| `auditor@gesap.gt` | `GESAP2026!` | AUDITOR (HSJD) |
| `dr.lopez@gesap.gt` | `Doctor2026!` | DOCTOR (HSJD) |
| `asistente.pre@gesap.gt` | `Asistente2026!` | ASISTENTE_PREHOSPITALARIO |
| `asistente.rec@gesap.gt` | `Asistente2026!` | ASISTENTE_RECEPCION_CLINICA (HSJD) |

## Módulos

| Módulo | Endpoints principales |
|--------|-----------------------|
| `auth` | `POST /login`, `GET /profile` |
| `users` | CRUD de usuarios, toggle-active, cambiar contraseña |
| `roles` | Listado de roles del sistema |
| `patients` | CRUD de pacientes, alergias, expedientes, tratamientos |
| `emergencies` | Crear/asignar/completar emergencias, GET /mine, GET /hospital/:id |
| `unidentified-patients` | Pacientes sin identificar vinculados a emergencias |
| `hospitals` | `GET /hospitals/active` — hospitales activos para formularios |
| `events` | WebSocket namespace `/user-events` path `/api-ws` — kick en tiempo real |

## WebSocket

El gateway `/user-events` detecta cada 4 segundos si la sesión del usuario sigue activa. Si fue cerrada por un auditor, emite `session:kicked` y desconecta el socket.

Conectar desde el cliente:
```js
import { io } from 'socket.io-client'
const socket = io('/', {
  path: '/api-ws',
  auth: { token: '<JWT>' },
  transports: ['polling', 'websocket'],
})
socket.on('session:kicked', () => { /* logout */ })
```

## Docker

```bash
# Desde el repo raíz GESAP
docker compose up --build gesap-api
```
