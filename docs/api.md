# API Reference

This document matches the current Express routes exposed by the backend. All application routes are mounted under `/api`. The API also exposes `GET /health` for a basic liveness check.

## Response Shape

The frontend API client forwards `response.data` directly, so endpoints should return JSON that is easy to consume without extra wrapping. Errors are normalized in the client into:

```json
{
  "success": false,
  "message": "Human readable message",
  "errors": [],
  "status": 400
}
```

## Authentication

Most protected routes use JWT authentication via `Authorization: Bearer <token>`. Role checks are enforced server-side with `roleGuard`.

## Auth Routes (`/api/auth`)

- `POST /register` - start email/password registration.
- `POST /verify-email` - verify OTP and complete account creation.
- `POST /resend-otp` - resend a verification code.
- `POST /login` - authenticate with email/password.
- `POST /google` - Google OAuth login.
- `GET /me` - return the current authenticated user.
- `POST /agents` - admin-only agent creation.
- `GET /customers` - admin-only customer listing.

## Orders Routes (`/api/orders`)

All routes below require authentication.

- `POST /preview` - calculate price without creating an order. Allowed roles: `customer`, `admin`.
- `POST /confirm` - create the order using the same server-side pricing flow. Allowed roles: `customer`, `admin`.
- `GET /` - list orders.
- `GET /:id` - fetch a single order.
- `PATCH /:id/status` - update order status. Allowed roles: `agent`, `admin`.
- `POST /:id/reschedule` - request a reschedule. Allowed role: `customer`.
- `POST /:id/auto-assign` - auto-assign an agent. Allowed role: `admin`.
- `PATCH /:id/assign` - manually assign an agent. Allowed role: `admin`.

## Tracking Routes (`/api/orders`)

- `GET /:id/timeline` - return the immutable tracking history for an order.

## Agents Routes (`/api/agents`)

All routes require authentication.

- `GET /me` - agent profile for the current user.
- `GET /` - list all agents. Allowed role: `admin`.
- `PATCH /clock-in` - mark the agent as on shift.
- `PATCH /clock-out` - mark the agent as off shift.
- `PATCH /location` - update the agent’s current location.
- `GET /my-orders` - list orders assigned to the current agent.

## Zones Routes (`/api/zones`)

- `GET /` - list zones and their linked areas.
- `POST /` - create a zone. Allowed role: `admin`.
- `PUT /:id` - update a zone. Allowed role: `admin`.
- `POST /areas` - map a pincode to a zone. Allowed role: `admin`.
- `DELETE /areas/:pincode` - remove a pincode mapping. Allowed role: `admin`.

## Rate Card Routes (`/api/rate-cards`)

These routes are admin-only.

- `GET /` - list rate cards.
- `POST /` - create a rate card.
- `PUT /:id` - update a rate card.
- `GET /cod-surcharge` - read COD surcharge configuration.
- `POST /cod-surcharge` - create or update COD surcharge configuration.

## Notes

- The current frontend default API base URL is `http://localhost:4000/api`.
- The backend starts the notification worker from `src/app.ts`, and there is also a standalone worker runner at `npm run worker`.
- Route names and role rules in this document should be treated as the source of truth for the current codebase.