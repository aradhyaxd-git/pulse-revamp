# Last-Mile Delivery Tracker

Last-Mile Delivery Tracker is a full-stack delivery workflow app with a Vite/React frontend and an Express/Prisma backend. It covers registration, order pricing, zone and rate-card management, agent assignment, tracking timelines, and queued notifications.

## Project Layout

- [backend](backend) contains the API, Prisma schema, and worker entrypoint.
- [frontend](frontend) contains the React app.
- [docs](docs) contains the architecture, API, and schema notes.

## Tech Stack

- Frontend: React 18, Vite, Chakra UI, React Router, Lucide React, Google OAuth.
- Backend: Node.js, Express 5, Prisma, PostgreSQL, Redis, BullMQ, JSON Web Tokens.
- Tooling: TypeScript in both apps.

## Local Setup

### Prerequisites

- Node.js 18 or newer.
- PostgreSQL.
- Redis.

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The API runs on `http://localhost:4000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default and calls the API through `VITE_API_BASE_URL`.

### Background Worker

The backend includes a separate worker entrypoint for notification jobs:

```bash
cd backend
npm run worker
```

In development, the API process also starts the notification worker from [backend/src/app.ts](backend/src/app.ts). Use the separate worker command when you want to run it independently.

## Environment Variables

Backend variables live in [backend/.env.example](backend/.env.example):

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `RESEND_API_KEY`
- `PORT`
- `NODE_ENV`
- `FRONTEND_URL`
- `EMAIL_PROVIDER`
- `EMAIL_API_KEY`
- `EMAIL_FROM`

Frontend variables used by Vite:

- `VITE_API_BASE_URL` defaults to `http://localhost:4000/api`
- `VITE_GOOGLE_CLIENT_ID`

## API Overview

The backend mounts routes under `/api`:

- `/api/auth`
- `/api/orders`
- `/api/agents`
- `/api/zones`
- `/api/rate-cards`

There is also a health check at `/health`.

## Documentation

- [API reference](docs/api.md)
- [Schema reference](docs/schema.md)
- [System design](docs/system-design.md)

## Notes

- The schema uses Prisma models such as `User`, `Zone`, `Area`, `PriceMatrix`, `Agent`, `Order`, `ShipmentEvent`, and `DispatchLog`.
- Order status transitions are enforced in [backend/src/lib/stateMachine.ts](backend/src/lib/stateMachine.ts).
- The frontend API client expects `VITE_API_BASE_URL` to point to the backend `/api` prefix.
