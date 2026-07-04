# Backend Reference

This file documents the current backend implementation in the repository.

## Stack

- Runtime: Node.js
- Framework: Express 5
- Language: TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Cache / queue: Redis and BullMQ
- Auth: JWT and bcryptjs
- Email: nodemailer with provider-backed configuration

## Scripts

- `npm run dev` - start the API in watch mode with `tsx`.
- `npm run worker` - start the worker runner in watch mode.
- `npm run build` - compile the backend with `tsc`.
- `npm run start` - run the built API from `dist/app.js`.
- `npm run db:generate` - generate Prisma client.
- `npm run db:migrate` - run Prisma migrations.
- `npm run db:seed` - seed the database.

## Runtime Flow

- `src/app.ts` loads env vars, sets up middleware, registers routes, and starts the API server.
- The backend currently starts the notification worker from the API process during development.
- `src/workers/workerRunner.ts` provides a standalone worker entrypoint.

## Route Modules

- `auth` - register, login, Google auth, OTP verification, current user, admin customer/agent utilities.
- `orders` - pricing preview, confirm, listing, status updates, reschedule, assignment.
- `agents` - agent profile, shift state, location updates, order list.
- `zones` - zone CRUD and pincode-to-zone mapping.
- `rateCards` - pricing matrix and COD surcharge configuration.
- `tracking` - order timeline retrieval.

## Schema Mapping

The Prisma schema maps to these main tables:

- `users`
- `zones`
- `areas`
- `rate_cards`
- `cod_surcharge_config`
- `agents`
- `orders`
- `order_tracking_history`
- `notification_outbox`

## Environment Variables

See [backend/.env.example](./.env.example) for the exact variable names currently used by the backend.

## Notes

- The backend is intentionally modular but not over-abstracted.
- The pricing path should remain shared between preview and confirm.
- Status transitions are validated in one place through the state machine helper.