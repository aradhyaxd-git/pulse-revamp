# Schema Reference

This document reflects the current Prisma schema in [backend/prisma/schema.prisma](../backend/prisma/schema.prisma).

## Design Goals

- Keep identity, delivery state, and pricing data separate.
- Make order history append-only.
- Keep zone and pricing lookups normalized so changes do not require code changes.

## Core Models

### `User`

- Table: `users`
- Stores authentication identity and global role.
- Key fields: `id`, `name`, `email`, `phone`, `passwordHash`, `role`, `createdAt`.
- Relations: customer orders, creator orders, shipment events, and optional `Agent` profile.

### `Zone`

- Table: `zones`
- Stores named delivery zones.
- Relations: `areas`, `agents`, origin and destination orders, and pricing matrix rows.

### `Area`

- Table: `areas`
- Maps a `pincode` to exactly one zone.
- Key fields: `pincode`, `zoneId`.

### `PriceMatrix`

- Table: `rate_cards`
- Stores pricing per `(fromZoneId, toZoneId, orderType)`.
- Key fields: `fromZoneId`, `toZoneId`, `orderType`, `pricePerKg`, `isActive`, timestamps.
- Constraint: unique combination of `fromZoneId`, `toZoneId`, and `orderType`.

### `CodFeeConfig`

- Table: `cod_surcharge_config`
- Stores COD surcharge rules per order type.
- Key fields: `orderType`, `type`, `value`, `isActive`.

### `Agent`

- Table: `agents`
- Stores delivery-specific operational state for a user with role `agent`.
- Key fields: `userId`, `zoneId`, `currentLat`, `currentLng`, `onShift`, `loadCount`, `slotLimit`, `updatedAt`.

### `Order`

- Table: `orders`
- Stores the shipment record and the frozen pricing snapshot.
- Key fields: `shipmentCode`, `customerId`, `createdById`, origin/destination addresses and pincodes, `originZoneId`, `destinationZoneId`, dimensions, `actualWeightKg`, `chargeableWeightKg`, `orderType`, `paymentType`, `priceMatrixId`, `pricingSnapshot`, `codFee`, `charge`, `deliveryStage`, `assignedAgentId`, `deferredDate`.

### `ShipmentEvent`

- Table: `order_tracking_history`
- Append-only order status history.
- Key fields: `orderId`, `prevStage`, `nextStage`, `changedById`, `changedByRole`, `notes`, `createdAt`.

### `DispatchLog`

- Table: `notification_outbox`
- Stores queued notification work for email and SMS.
- Key fields: `orderId`, `channel`, `payload`, `status`, `attempts`, `createdAt`.

## Enums

- `Role`: `customer`, `agent`, `admin`
- `OrderType`: `B2B`, `B2C`
- `PaymentType`: `PREPAID`, `COD`
- `OrderStatus`: `CREATED`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`, `RESCHEDULED`
- `FeeType`: `FLAT`, `PERCENTAGE`
- `DispatchChannel`: `EMAIL`, `SMS`
- `DispatchStatus`: `PENDING`, `SENT`, `FAILED`

## Important Constraints

- Order history is append-only by design.
- Rate cards are unique per route and order type.
- A pincode maps to one zone.
- The order row stores a frozen pricing snapshot so historical charges do not change when pricing config changes later.
- Status transitions are validated by the state machine in [backend/src/lib/stateMachine.ts](../backend/src/lib/stateMachine.ts).

## Operational Notes

- The backend currently models agent location as `Float` latitude/longitude values rather than a PostGIS geometry column.
- Notification jobs are stored in the outbox table and processed by the worker pipeline.
- The schema is intentionally normalized so admin changes to zones or rate cards stay isolated from historical orders.