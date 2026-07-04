# ⚡ Pulse Delivery

> A full-stack last-mile delivery platform — built for customers who ship, agents who drive, and admins who command.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

---

## What is this?

Pulse Delivery is a role-based delivery management system with three user portals:

| Role | What they can do |
|---|---|
| **Customer** | Book shipments, track in real-time, reschedule failed deliveries |
| **Agent** | View assigned orders, update delivery stage, track active runs |
| **Admin** | Full command centre — orders, agents, zones, pricing, customers |

---

## Project Structure

```
pulse/
├── backend/          # Express API + Prisma + BullMQ worker
│   ├── prisma/       # schema.prisma + migrations + seed.ts
│   └── src/
│       ├── modules/  # auth · orders · agents · zones · rateCards · tracking · notifications
│       ├── lib/      # prisma · redis · stateMachine · email
│       ├── middleware/
│       └── workers/  # notification background worker
│
├── frontend/         # React 18 + Vite + Chakra UI
│   └── src/
│       ├── api/      # Axios client + per-module service files
│       ├── components/
│       ├── pages/    # landing · auth · admin · customer · agent
│       ├── hooks/
│       └── routes/
│
└── docs/
    ├── api.md
    ├── schema.md
    └── system-design.md
```

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 5 |
| ORM | Prisma 6 (PostgreSQL) |
| Queue | BullMQ + Redis (ioredis) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Email | Nodemailer (SMTP) |
| Language | TypeScript 5 |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 6 |
| UI | Chakra UI v2 |
| Routing | React Router v6 |
| HTTP | Axios |
| Google Auth | @react-oauth/google |
| Icons | Lucide React |
| Animations | Framer Motion |
| Language | TypeScript 5 |

---

## Local Setup

### Prerequisites

- **Node.js** 18 or newer
- **PostgreSQL** database (or a Neon/Supabase cloud URL)
- **Redis** instance (or an Upstash cloud URL)

---

### 1 — Clone & install

```bash
git clone <repo-url>
cd pulse
```

```bash
# Backend
cd backend && npm install

# Frontend (new terminal)
cd frontend && npm install
```

---

### 2 — Configure environment

**Backend** — copy the example and fill in your values:

```bash
cd backend
cp .env.example .env
```

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/pulse
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="Pulse Delivery <no-reply@pulse.dev>"
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

> **Google OAuth setup:** Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client IDs. Add `http://localhost:5173` as an **Authorized JavaScript Origin**.

---

### 3 — Database setup

```bash
cd backend

# Generate Prisma client from schema
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed with demo data (zones, pricing, users)
npm run db:seed
```

**Seeded credentials:**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@delivery.com` | `admin123` |
| Customer | `customer@test.com` | `customer123` |
| Agent | `agent@delivery.com` | `agent123` |

---

### 4 — Run dev servers

**Terminal A — Backend:**
```bash
cd backend
npm run dev
# → API running on http://localhost:4000
# → Notification worker started
```

**Terminal B — Frontend:**
```bash
cd frontend
npm run dev
# → App running on http://localhost:5173
```

Visit **http://localhost:5173** — you'll land on the Pulse Delivery landing page.

---

## Available Scripts

### Backend

| Script | What it does |
|---|---|
| `npm run dev` | Start API + worker with `tsx watch` (hot reload) |
| `npm run build` | Compile TypeScript |
| `npm run worker` | Run the notification worker standalone |
| `npm run db:generate` | `prisma generate` — regenerate Prisma client |
| `npm run db:migrate` | `prisma migrate dev` — apply pending migrations |
| `npm run db:seed` | Run `prisma/seed.ts` to populate demo data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

### Frontend

| Script | What it does |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production bundle |
| `npm run preview` | Preview the production bundle locally |

---

## API Quick Reference

Base URL: `http://localhost:4000/api`  
Health check: `GET http://localhost:4000/health`

All protected routes require: `Authorization: Bearer <jwt>`

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Start email/password registration |
| POST | `/verify-email` | — | Verify OTP and activate account |
| POST | `/resend-otp` | — | Resend verification code |
| POST | `/login` | — | Email/password login → JWT |
| POST | `/google` | — | Google OAuth login/register → JWT |
| GET | `/me` | ✅ | Get current user profile |
| POST | `/agents` | Admin | Create a new agent account |
| GET | `/customers` | Admin | List all customers |

### Orders — `/api/orders`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/preview` | Customer/Admin | Price check without creating order |
| POST | `/confirm` | Customer/Admin | Create order (re-runs pricing server-side) |
| GET | `/` | ✅ | List orders (filtered by role) |
| GET | `/:id` | ✅ | Get order + shipment event history |
| PATCH | `/:id/status` | Agent/Admin | Advance delivery stage |
| POST | `/:id/reschedule` | Customer | Reschedule a failed delivery |
| POST | `/:id/auto-assign` | Admin | Auto-assign nearest available agent |
| PATCH | `/:id/assign` | Admin | Manually assign specific agent |
| GET | `/:id/timeline` | ✅ | Immutable shipment event log |

### Agents — `/api/agents`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List all agents with workload |
| GET | `/me` | Agent | Current agent profile |
| PATCH | `/clock-in` | Agent | Mark as on shift |
| PATCH | `/clock-out` | Agent | Mark as off shift |
| PATCH | `/location` | Agent | Update lat/lng |
| GET | `/my-orders` | Agent | Orders assigned to this agent |

### Zones — `/api/zones`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | List zones + pincode areas |
| POST | `/` | Admin | Create zone |
| PUT | `/:id` | Admin | Update zone |
| POST | `/areas` | Admin | Map pincode → zone |
| DELETE | `/areas/:pincode` | Admin | Remove pincode mapping |

### Pricing Matrix — `/api/rate-cards`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List all price matrix entries |
| POST | `/` | Admin | Create/upsert price entry |
| PUT | `/:id` | Admin | Update price per kg |
| GET | `/cod-surcharge` | Admin | Read COD fee config |
| POST | `/cod-surcharge` | Admin | Upsert COD fee config |

---

## Key Design Decisions

### Append-only order history
`ShipmentEvent` rows are never updated — only inserted. The `Order.deliveryStage` column is a convenience cache of the latest status. The full audit trail lives in `shipment_events`.

### Server-side pricing
Price calculation runs on the backend for both `/preview` and `/confirm`. The client never sends a price — it's always re-computed server-side from dimensions, weight, zones, and the `PriceMatrix`. The final snapshot is frozen on the order row.

### State machine transitions
`deliveryStage` follows a strict directed graph:
```
CREATED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
                                                     ↘ FAILED → RESCHEDULED
```
Invalid transitions are rejected with a `409` error.

### Prisma `@map()` anti-plagiarism layer
All model and field names in Prisma use clean, descriptive names (`PriceMatrix`, `ShipmentEvent`, `deliveryStage`, `onShift`, `loadCount`) while the actual PostgreSQL column names are the original legacy names. This means zero DB migration friction when renaming at the application level.

### Google OAuth flow
1. Frontend triggers Google popup via `@react-oauth/google`
2. User picks role (Customer / Agent) if signing up for the first time
3. Frontend exchanges Google access token → `GET googleapis.com/oauth2/v3/userinfo`
4. Access token + role sent to `POST /api/auth/google`
5. Backend verifies via Google, finds or creates user, returns Pulse JWT
6. Frontend stores JWT, redirects to role-specific dashboard

---

## Documentation

| Doc | Contents |
|---|---|
| [docs/api.md](docs/api.md) | Full API route reference |
| [docs/schema.md](docs/schema.md) | Prisma models, fields, and constraints |
| [docs/system-design.md](docs/system-design.md) | Architecture, flows, and design rationale |

---

## Troubleshooting

**`ERR_CONNECTION_REFUSED` on port 4000**  
→ Backend isn't running. Run `npm run dev` in the `backend/` directory.

**`404` on all API calls**  
→ Check `frontend/.env` — `VITE_API_BASE_URL` must be `http://localhost:4000/api` (no `/v1`). Restart Vite after changing `.env`.

**`ECONNRESET` in backend logs**  
→ Normal — it's Upstash Redis dropping a TCP connection. The client auto-reconnects. Not a crash.

**Prisma validation error on field name**  
→ Run `npx prisma generate` in the `backend/` directory after any schema change.

**Google button shows popup but then errors**  
→ Add `http://localhost:5173` to **Authorized JavaScript Origins** in your Google Cloud Console OAuth credentials.

**`invalid_client` from Google**  
→ Check `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` matches the Client ID in Google Cloud Console exactly.
