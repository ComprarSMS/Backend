# Backend

API de QuieroUnSMS. NestJS, Prisma, Socket.io y BullMQ.

El proveedor de SMS de esta demo es un job de BullMQ: al reservar un número, unos segundos después llega un código de verificación ficticio. Otro job libera el número cuando vence el tiempo.

## Requisitos

Postgres y Redis en local. Desde el repo `docker`:

```bash
docker compose up -d postgres redis
```

## Arranque

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

La API queda en `http://localhost:4000`.

## Endpoints

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/health` | Estado del proceso |
| GET | `/services` | Servicios (WhatsApp, Google, …) |
| GET | `/numbers` | Números virtuales |
| GET | `/rentals` | Sesiones activas y las últimas cerradas |
| POST | `/rentals` | Reserva `{ virtualNumberId, serviceSlug }` |
| POST | `/rentals/:id/cancel` | Libera el número |
| POST | `/rentals/:id/complete` | Cierra la sesión al usar el código |
| POST | `/rentals/:id/simulate` | Inserta otro SMS de prueba |

Socket.io emite `sms.received` y `rental.updated`.

`npm run db:seed` borra las sesiones de demostración y vuelve a cargar números y servicios.
