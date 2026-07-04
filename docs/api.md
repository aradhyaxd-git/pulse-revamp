# API Reference — Pulse Delivery

Base URL: `http://localhost:4000/api`  
Health check: `GET /health` → `{ "status": "ok", "timestamp": "..." }`

---

## Auth & Response Contract

### JWT
All protected endpoints require:
```
Authorization: Bearer <token>
```

Tokens are returned from `/auth/login` and `/auth/google`. They expire per `JWT_EXPIRES_IN` (default `7d`).

### Success response
Endpoints return JSON directly — no envelope wrapper. The Axios client in the frontend unwraps `response.data` automatically.

### Error response
All errors are normalized by the client into:
```json
{
  "success": false,
  "message": "Human readable description",
  "errors": [],
  "status": 422
}
```

Common status codes:
| Code | Meaning |
|---|---|
| `400` | Bad request / missing field |
| `401` | Missing or invalid JWT |
| `403` | Authenticated but wrong role |
| `404` | Resource not found |
| `409` | Conflict (e.g. invalid state transition, duplicate) |
| `422` | Business rule violation |
| `503` | No agents available |

---

## Auth Routes — `/api/auth`

### `POST /register`
Start customer registration. Sends an OTP email.

**Body:**
```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "secret123",
  "phone": "9999999999"
}
```

**Response:** `201` — `{ "message": "OTP sent to ada@example.com" }`

---

### `POST /verify-email`
Complete registration by submitting the OTP.

**Body:** `{ "email": "ada@example.com", "otp": "482910" }`  
**Response:** `{ "token": "...", "user": { "id", "name", "email", "role" } }`

---

### `POST /resend-otp`
Resend a verification code (rate-limited via Redis).

**Body:** `{ "email": "ada@example.com" }`  
**Response:** `{ "message": "OTP resent" }`

---

### `POST /login`
Authenticate with email and password.

**Body:** `{ "email": "...", "password": "..." }`  
**Response:** `{ "token": "...", "user": { "id", "name", "email", "role" } }`

---

### `POST /google`
Google OAuth sign-in or sign-up. New users get a role assigned based on the `role` field.

**Body:**
```json
{
  "credential": "<Google access_token from @react-oauth/google>",
  "role": "customer"
}
```
- `role` is only used when creating a **new** account. Returning users keep their existing role.
- Valid values: `customer`, `agent`

**Response:** `{ "token": "...", "user": { "id", "name", "email", "role" } }`

---

### `GET /me` 🔒
Return the current authenticated user's profile.

**Response:** `{ "user": { "id", "name", "email", "role", "phone" } }`

---

### `POST /agents` 🔒 Admin only
Create a new agent account directly (bypasses OTP flow).

**Body:** `{ "name", "email", "password", "phone", "zoneId" }`  
**Response:** `201` — `{ "user": { ... } }`

---

### `GET /customers` 🔒 Admin only
List all customer accounts with their order counts.

**Response:** `{ "customers": [{ "id", "name", "email", "phone", "createdAt", "_count" }] }`

---

## Orders Routes — `/api/orders`

### `POST /preview` 🔒 Customer · Admin
Calculate shipping cost without creating an order. Same pricing logic as confirm.

**Body:**
```json
{
  "pickupPincode": "110001",
  "dropPincode": "400001",
  "orderType": "B2C",
  "paymentType": "COD",
  "lengthCm": 30,
  "breadthCm": 20,
  "heightCm": 15,
  "actualWeightKg": 2.5
}
```

**Response:**
```json
{
  "fromZoneId": "...", "fromZoneName": "North Delhi",
  "toZoneId": "...", "toZoneName": "Mumbai Central",
  "rateCardId": "...", "ratePerKg": 12.50,
  "billableWeight": 2.5, "base": 31.25,
  "codSurcharge": 3.13, "total": 34.38
}
```

---

### `POST /confirm` 🔒 Customer · Admin
Create an order. Pricing is re-computed server-side — never trusts client price.

**Body:** Same as `/preview` plus:
```json
{
  "customerId": "...",
  "createdById": "...",
  "originAddress": "A-12 Connaught Place, New Delhi",
  "destinationAddress": "Bandra West, Mumbai"
}
```

**Response:** The full created `Order` object.

---

### `GET /` 🔒
List orders. Results are automatically scoped by role:
- **Customer** → only their own orders
- **Agent** → only their assigned orders
- **Admin** → all orders

**Query params:** `?status=CREATED,PICKED_UP` · `?zoneId=` · `?agentId=`

---

### `GET /:id` 🔒
Get a single order with full detail: customer, zones, agent, and shipment event history.

---

### `PATCH /:id/status` 🔒 Agent · Admin
Advance the delivery stage. Transitions are validated by the state machine.

**Body:** `{ "toStatus": "PICKED_UP", "notes": "Picked up at 10:30am" }`  
**Response:** `{ "success": true, "newStatus": "PICKED_UP" }`

**Valid transitions:**
```
CREATED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
                                                     ↘ FAILED → RESCHEDULED
```

---

### `POST /:id/reschedule` 🔒 Customer
Reschedule a delivery that reached `FAILED` status.

**Body:** `{ "rescheduleDate": "2025-08-15" }`  
**Response:** `{ "success": true }`

---

### `POST /:id/auto-assign` 🔒 Admin
Auto-assign the nearest available, on-shift agent within the pickup zone.

**Response:** `{ "agentId": "..." }`  
**Errors:** `503` if no agents are available.

---

### `PATCH /:id/assign` 🔒 Admin
Manually assign a specific agent to an order.

**Body:** `{ "agentId": "..." }`

---

### `GET /:id/timeline` 🔒
Return the append-only `ShipmentEvent` history for an order, ordered by `createdAt` ascending.

**Response:**
```json
{
  "timeline": [
    {
      "id": "...", "orderId": "...",
      "prevStage": null, "nextStage": "CREATED",
      "changedById": "...", "changedByRole": "customer",
      "notes": null, "createdAt": "...",
      "changedBy": { "name": "Ada Lovelace", "role": "customer" }
    }
  ]
}
```

---

## Agents Routes — `/api/agents`

### `GET /` 🔒 Admin
List all agents with their user profile, zone, workload (`loadCount`, `slotLimit`), and shift status.

### `GET /me` 🔒 Agent
Return the agent profile for the currently authenticated user.

### `PATCH /clock-in` 🔒 Agent
Set `onShift = true`. Agent becomes eligible for auto-assignment.

### `PATCH /clock-out` 🔒 Agent
Set `onShift = false`.

### `PATCH /location` 🔒 Agent
Update agent's current coordinates.  
**Body:** `{ "lat": 28.6139, "lng": 77.2090 }`

### `GET /my-orders` 🔒 Agent
List all orders currently assigned to this agent.

---

## Zones Routes — `/api/zones`

### `GET /`
Public. Returns all zones with their linked `Area` (pincode) records.

### `POST /` 🔒 Admin
Create a zone. **Body:** `{ "name": "North Delhi" }`

### `PUT /:id` 🔒 Admin
Update zone name.

### `POST /areas` 🔒 Admin
Map a pincode to a zone. **Body:** `{ "pincode": "110001", "zoneId": "..." }`

### `DELETE /areas/:pincode` 🔒 Admin
Remove a pincode-to-zone mapping.

---

## Pricing Matrix Routes — `/api/rate-cards`

All routes are Admin only.

### `GET /`
List all active `PriceMatrix` entries with zone names.

### `POST /`
Create or upsert a price matrix entry.  
**Body:** `{ "fromZoneId", "toZoneId", "orderType": "B2C", "pricePerKg": 12.50 }`

### `PUT /:id`
Update the `pricePerKg` for an existing matrix entry.  
**Body:** `{ "ratePerKg": 14.00 }`

### `GET /cod-surcharge`
Return all `CodFeeConfig` records.

### `POST /cod-surcharge`
Create or update a COD fee config.  
**Body:** `{ "orderType": "B2C", "type": "PERCENTAGE", "value": 2.5 }`