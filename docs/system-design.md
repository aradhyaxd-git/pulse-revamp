# System Design — Pulse Delivery

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  React 18 + Vite · Chakra UI · React Router · Axios        │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express 5 API                            │
│  auth · orders · agents · zones · rateCards · tracking      │
│                                                             │
│  Middleware: helmet · cors · express.json                   │
│  Guards:     authGuard (JWT) · roleGuard (RBAC)             │
└──────────┬────────────────────────────────┬─────────────────┘
           │ Prisma ORM                     │ ioredis
           ▼                               ▼
┌──────────────────┐            ┌─────────────────────────────┐
│   PostgreSQL     │            │   Redis (Upstash/local)      │
│                  │            │                             │
│ users            │            │ Rate cache: rate:<zones>    │
│ agents           │            │ COD cache:  cod:<type>      │
│ orders           │            │ OTP store:  otp:<email>     │
│ order_tracking_  │            │ BullMQ queues               │
│  history         │            └──────────────┬──────────────┘
│ rate_cards       │                           │ BullMQ
│ cod_surcharge_   │            ┌──────────────▼──────────────┐
│  config          │            │   Notification Worker        │
│ notification_    │            │   (runs in same process      │
│  outbox          │            │    or standalone)            │
│ ...              │            │                             │
└──────────────────┘            │  Reads DispatchLog rows     │
                                │  Sends email via SMTP       │
                                └─────────────────────────────┘
```

---

## Request Lifecycle

```
Browser
  → Axios (attaches JWT from localStorage)
  → Express router
  → authGuard (verify JWT, attach req.user)
  → roleGuard (check role against allowed set)
  → Controller (thin — just calls service, sends response)
  → Service (business logic, Prisma queries, cache ops)
  → PostgreSQL / Redis
  → JSON response
```

---

## Core Flows

### Pricing Flow

The same `calculateCharge()` function runs for **both** preview and confirm — there is no separate "trust the client price" path.

```
Client sends: pickupPincode, dropPincode, dimensions, weight, orderType, paymentType
                              │
                    zonesService.resolveZoneByPincode()
                              │ (Redis cache → DB miss → cache write)
                              ▼
                    rateCardsService.getRateCard(fromZone, toZone, orderType)
                              │ (Redis cache → DB miss → cache write)
                              ▼
            billableWeight = max(actualWeightKg, lengthCm×breadthCm×heightCm / 5000)
                              │
            base = pricePerKg × billableWeight
                              │
            if paymentType === COD:
              codFeeConfig → apply FLAT or PERCENTAGE surcharge
                              │
            total = base + codFee
                              │
            /preview → return breakdown (no DB write)
            /confirm → re-run same path, persist Order + ShipmentEvent
```

---

### Order Status Flow

Status is a **directed acyclic graph** enforced by `stateMachine.ts`:

```
CREATED
  └─→ PICKED_UP
        └─→ IN_TRANSIT
              └─→ OUT_FOR_DELIVERY
                    ├─→ DELIVERED  (terminal)
                    └─→ FAILED
                          └─→ RESCHEDULED
                                └─→ (re-enters PICKED_UP after auto-assign)
```

Every transition:
1. Validates via `validateTransition(currentStage, newStage)` — throws `409` if invalid
2. Updates `Order.deliveryStage` (convenience cache)
3. Inserts a `ShipmentEvent` row (immutable audit trail)
4. If terminal (`DELIVERED` or `FAILED`): decrements `Agent.loadCount`
5. Enqueues a `DispatchLog` notification (best-effort, never blocks the response)

---

### Agent Assignment Flow

**Auto-assign** uses a raw SQL query with `FOR UPDATE SKIP LOCKED` to prevent two concurrent requests from assigning the same agent:

```sql
SELECT id, active_order_count
FROM agents
WHERE clocked_in = true
  AND active_order_count < max_capacity
  AND (zone_id = $pickupZoneId OR zone_id IS NOT NULL)
ORDER BY
  CASE WHEN zone_id = $pickupZoneId THEN 0 ELSE 1 END,
  active_order_count ASC
LIMIT 1
FOR UPDATE SKIP LOCKED
```

All inside a `prisma.$transaction()` — the `loadCount` increment and `assignedAgentId` update are atomic.

**Manual assign** follows the same transaction pattern, additionally:
- Decrements the previous agent's `loadCount` if this is a reassignment
- Inserts a `ShipmentEvent` audit row
- Enqueues a notification

---

### Google OAuth Flow

```
User clicks "Continue with Google"
  → @react-oauth/google triggers popup
  → Google returns access_token

If new user:
  → Role picker modal (Customer / Agent)

Frontend:
  POST /api/auth/google { credential: access_token, role }

Backend:
  → fetch https://www.googleapis.com/oauth2/v3/userinfo (Bearer access_token)
  → Validate response (email required)
  → prisma.user.findUnique({ email })
    → Found: return JWT for existing user (ignore role param)
    → Not found: create User (+ Agent record if role=agent), return JWT

Frontend:
  → localStorage.setItem('token', jwt)
  → localStorage.setItem('user', JSON.stringify(user))
  → navigate(`/${user.role}/dashboard`)
```

---

### Notification Flow

Notifications are fire-and-forget — they never block the API response.

```
Service (e.g. orders.service.ts):
  try {
    await notificationsService.enqueueForOrder(orderId, event, email)
  } catch {
    console.warn(...) // log, don't crash
  }
          │
          ▼
  prisma.dispatchLog.create({ status: PENDING, ... })
  bullMQ.queue.add(job)
          │
          ▼ (async, separate process)
  notificationWorker picks up job
  → reads DispatchLog
  → sends email via SMTP (Nodemailer)
  → updates DispatchLog.status = SENT | FAILED
  → increments attempts on failure (retry up to 3x)
```

---

## Caching Strategy

Redis is used for two purposes:

| Key pattern | TTL | Purpose |
|---|---|---|
| `rate:<fromId>:<toId>:<type>` | 1 hour | PriceMatrix lookup cache |
| `cod:<orderType>` | 1 hour | CodFeeConfig cache |
| `otp:<email>` | 10 min | OTP verification code |

Cache is invalidated on write — any update to a PriceMatrix or CodFeeConfig calls `cacheDel()` on the relevant key.

---

## Security Model

| Concern | How it's handled |
|---|---|
| Authentication | JWT signed with `JWT_SECRET`, verified on every protected route |
| Authorization | `roleGuard` middleware checks `req.user.role` server-side |
| Passwords | `bcrypt` with cost factor 12 |
| CORS | `FRONTEND_URL` env var restricts allowed origins |
| Price integrity | Server re-computes price on `/confirm` — client price is never trusted |
| Concurrency | `FOR UPDATE SKIP LOCKED` in auto-assign prevents double-assignment |
| Google users | No password stored — `passwordHash` is empty string, auth goes through Google |

---

## Frontend Architecture

```
src/
├── api/
│   ├── client.ts          Axios instance + JWT interceptor + error normalizer
│   └── services/          Per-feature service files (auth, orders, agents, ...)
│
├── components/
│   ├── common/            Reusable: StageBadge, ShipmentTimeline, DataTable,
│   │                      MetricCard, GoogleAuthButton
│   └── layout/            DashboardLayout, Sidebar, Topbar
│
├── hooks/
│   ├── useAuth.ts         Auth context: user, login(), logout()
│   └── useApiToast.ts     showSuccess / showError helpers
│
├── pages/
│   ├── landing/           Public marketing page (/)
│   ├── auth/              Login, Register
│   ├── admin/             Dashboard, Orders, Agents, Zones, Customers, Settings
│   ├── customer/          Dashboard, CreateOrder, OrderHistory, TrackingDetails
│   └── agent/             Dashboard, ActiveRun, AssignedOrders, OrderTracking
│
├── routes/
│   ├── appRouter.tsx      BrowserRouter + all routes
│   └── protectedRoute.tsx Role-gated wrapper
│
└── theme/                 Chakra UI theme: fonts, colors, component variants
```

---

## Known Limitations

| Area | Current State |
|---|---|
| Agent location | Stored as `Float` lat/lng — not PostGIS geometry, no real-time map |
| Auth (Google) | Access token verified via userinfo endpoint — no OpenID Connect ID token verification |
| Multi-tenancy | Single operator — no org isolation |
| Real-time | No WebSocket — stage updates require page refresh or polling |
| Pricing | Zone-based flat rate — no live distance/traffic routing |
| SMS | `DispatchChannel.SMS` defined in schema but email-only in worker implementation |