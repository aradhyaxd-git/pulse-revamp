# System Design

This document describes the architecture currently implemented in the repository.

## High-Level Architecture

The application uses a straightforward three-part setup:

- Frontend: a React SPA built with Vite and Chakra UI.
- API: an Express backend with modular route handlers.
- Data and background jobs: PostgreSQL through Prisma, plus Redis for queueing and shared state.

The backend starts from [backend/src/app.ts](../backend/src/app.ts), and a separate worker runner exists at [backend/src/workers/workerRunner.ts](../backend/src/workers/workerRunner.ts).

## Request Flow

1. The frontend sends REST requests to the backend using the shared Axios client.
2. Express applies middleware such as `helmet`, `cors`, and JSON parsing.
3. `authGuard` and `roleGuard` enforce authentication and authorization.
4. Controllers delegate to service functions.
5. Services read and write Prisma models.
6. The response is serialized as JSON.

## Pricing Flow

The pricing flow is built around the same server-side pricing logic for preview and confirm:

1. The client submits order dimensions, weight, pincodes, order type, and payment type.
2. The backend resolves pickup and drop pincodes to zones through `Area` records.
3. The backend resolves the matching `PriceMatrix` row and optional COD surcharge.
4. Billable weight is computed as the maximum of actual and volumetric weight.
5. The preview endpoint returns the price breakdown without creating an order.
6. The confirm endpoint repeats the same pricing path and then persists the order.

This avoids client-side price trust and keeps the preview and confirm paths aligned.

## Status and History Flow

Orders track the current stage in the `orders.current_status` column and the full history in `order_tracking_history`.

Allowed transitions are defined in [backend/src/lib/stateMachine.ts](../backend/src/lib/stateMachine.ts). History rows are appended whenever a status changes. The design goal is that the history table acts as the audit trail, while the order row stores the current convenience state for filtering.

## Agent Assignment Flow

Agents are modeled as a profile on top of `User`.

- `clocked_in` / `onShift` marks availability.
- `active_order_count` / `loadCount` limits capacity.
- `zone_id` helps narrow the eligible agent pool.

Assignment is handled by order service logic and exposed through order routes for auto-assign and manual assign operations.

## Notification Flow

Notification work is written to the outbox table and consumed asynchronously by the worker path.

- `notification_outbox` stores the queued payload.
- The worker runner starts notification processing.
- Email delivery uses the configured email provider.

The backend currently starts the notification worker from the API process during development and also exposes a standalone worker entrypoint for separate execution.

## Security

- JWTs protect authenticated routes.
- Role checks are server-side, not just a frontend display concern.
- Passwords are stored as hashes.
- CORS is restricted through the `FRONTEND_URL` environment variable.

## Limitations and Current Scope

- Agent location is stored as latitude/longitude floats, not PostGIS geometry.
- The codebase currently uses REST only.
- The delivery flow is single-operator and not multi-tenant.
- Pricing is zone-based rather than live geographic routing.

## Why This Shape Works

The repo keeps the model intentionally simple so the core business logic stays testable:

- pricing lives behind a shared service path,
- status history is append-only,
- route handlers stay thin,
- workers are separated from API concerns,
- Prisma keeps schema and runtime types aligned.