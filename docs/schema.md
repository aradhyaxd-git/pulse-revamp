# Schema Reference — Pulse Delivery

Source of truth: [backend/prisma/schema.prisma](../backend/prisma/schema.prisma)

> **Anti-plagiarism layer:** Prisma model names and field names differ from the underlying PostgreSQL column names via `@map()`. The application uses clean, descriptive names; the DB retains the original column names.

---

## Entity Relationship Overview

```
User ──────────────── Agent (1:0..1)
 │
 ├── Order (as customer)
 └── Order (as creator)
      │
      ├── ShipmentEvent[]   (append-only audit log)
      ├── DispatchLog[]     (notification outbox)
      ├── Agent (assignedAgent)
      ├── Zone  (originZone)
      └── Zone  (destinationZone)

Zone ──── Area[] (pincodes)
Zone ──── PriceMatrix[] (from)
Zone ──── PriceMatrix[] (to)

OrderType ──── PriceMatrix
OrderType ──── CodFeeConfig
```

---

## Models

### `User`
**Table:** `users`

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (UUID) | PK |
| `name` | `String` | |
| `email` | `String` | Unique |
| `phone` | `String?` | Optional |
| `passwordHash` | `String` | `password_hash` — empty string for Google-only users |
| `role` | `Role` | `customer` · `agent` · `admin` |
| `createdAt` | `DateTime` | `created_at` |

**Relations:** `ordersAsCustomer`, `ordersCreatedBy`, `shipmentEvents`, `agent?`

---

### `Zone`
**Table:** `zones`

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (UUID) | PK |
| `name` | `String` | Unique |

**Relations:** `areas`, `agents`, `originOrders`, `destinationOrders`, `fromPriceMatrices`, `toPriceMatrices`

---

### `Area`
**Table:** `areas`

Maps a pincode to exactly one zone. Used to resolve pickup/drop pincodes during pricing.

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (UUID) | PK |
| `pincode` | `String` | Unique |
| `zoneId` | `String` | FK → `Zone` |

---

### `PriceMatrix`
**Table:** `rate_cards`  
**Prisma name:** `PriceMatrix` (was `RateCard`)

Stores per-kg pricing for a zone pair + order type combination.

| Field | Prisma name | DB column | Type | Notes |
|---|---|---|---|---|
| PK | `id` | `id` | UUID | |
| | `fromZoneId` | `from_zone_id` | FK → Zone | |
| | `toZoneId` | `to_zone_id` | FK → Zone | |
| | `orderType` | `order_type` | `OrderType` | |
| | `pricePerKg` | `rate_per_kg` | `Decimal` | Use `Number()` in code |
| | `isActive` | `is_active` | `Boolean` | Filter for `true` on lookups |
| | `createdAt` | `created_at` | DateTime | |
| | `updatedAt` | `updated_at` | DateTime | |

**Unique constraint:** `(fromZoneId, toZoneId, orderType)`

---

### `CodFeeConfig`
**Table:** `cod_surcharge_config`  
**Prisma name:** `CodFeeConfig` (was `CodSurchargeConfig`)

Stores COD surcharge rules per order type.

| Field | Prisma name | DB column | Notes |
|---|---|---|---|
| | `orderType` | `order_type` | Unique — one config per type |
| | `type` | `type` | `FeeType`: `FLAT` or `PERCENTAGE` |
| | `value` | `value` | `Decimal` — flat amount or % |
| | `isActive` | `is_active` | |

---

### `Agent`
**Table:** `agents`

Delivery-specific operational state. One-to-one with a `User` of role `agent`.

| Field | Prisma name | DB column | Notes |
|---|---|---|---|
| | `userId` | `user_id` | FK → User (unique) |
| | `zoneId` | `zone_id` | FK → Zone (nullable) |
| | `currentLat` | `current_lat` | `Float?` |
| | `currentLng` | `current_lng` | `Float?` |
| | `onShift` | `clocked_in` | `Boolean` — eligible for auto-assign when `true` |
| | `loadCount` | `active_order_count` | `Int` — current active orders |
| | `slotLimit` | `max_capacity` | `Int` — max concurrent orders (default 5) |
| | `updatedAt` | `updated_at` | |

---

### `Order`
**Table:** `orders`

The core shipment record. Contains a frozen pricing snapshot so historical charges never change.

| Field | Prisma name | DB column | Notes |
|---|---|---|---|
| | `shipmentCode` | `tracking_id` | Auto-generated unique tracking ref |
| | `customerId` | `customer_id` | FK → User |
| | `createdById` | `created_by_id` | FK → User |
| | `originAddress` | `pickup_address` | |
| | `originPincode` | `pickup_pincode` | |
| | `originZoneId` | `pickup_zone_id` | Resolved from pincode at confirm |
| | `destinationAddress` | `drop_address` | |
| | `destinationPincode` | `drop_pincode` | |
| | `destinationZoneId` | `drop_zone_id` | |
| | `lengthCm` | `length_cm` | `Decimal` |
| | `breadthCm` | `breadth_cm` | `Decimal` |
| | `heightCm` | `height_cm` | `Decimal` |
| | `actualWeightKg` | `actual_weight_kg` | `Decimal` |
| | `volumetricWeightKg` | `billable_weight_kg` | `Decimal` — max(actual, volumetric) |
| | `orderType` | `order_type` | `B2B` · `B2C` |
| | `paymentType` | `payment_type` | `PREPAID` · `COD` |
| | `priceMatrixId` | `rate_card_id` | FK → PriceMatrix (frozen ref) |
| | `feeSnapshot` | `applied_rate_snapshot` | `Json` — full pricing breakdown at order time |
| | `codFee` | `cod_surcharge` | `Decimal?` |
| | `charge` | `charge` | `Decimal` — total amount |
| | `deliveryStage` | `current_status` | `OrderStatus` enum — current stage |
| | `assignedAgentId` | `assigned_agent_id` | FK → Agent (nullable) |
| | `rescheduledFor` | `reschedule_date` | `DateTime?` |
| | `createdAt` | `created_at` | |
| | `updatedAt` | `updated_at` | |

**Relations:** `customer`, `createdBy`, `originZone`, `destinationZone`, `assignedAgent`, `shipmentEvents`, `dispatchLogs`

---

### `ShipmentEvent`
**Table:** `order_tracking_history`  
**Prisma name:** `ShipmentEvent` (was `OrderTrackingHistory`)

Append-only delivery stage audit log. Never updated, only inserted.

| Field | Prisma name | DB column | Notes |
|---|---|---|---|
| | `orderId` | `order_id` | FK → Order |
| | `prevStage` | `from_status` | `OrderStatus?` — null for first event |
| | `nextStage` | `to_status` | `OrderStatus` |
| | `changedById` | `actor_id` | FK → User |
| | `changedByRole` | `actor_role` | `Role` |
| | `notes` | `notes` | `String?` |
| | `createdAt` | `created_at` | Immutable timestamp |

---

### `DispatchLog`
**Table:** `notification_outbox`  
**Prisma name:** `DispatchLog` (was `NotificationOutbox`)

Outbox table for queued notification jobs processed by BullMQ worker.

| Field | Notes |
|---|---|
| `orderId` | FK → Order |
| `channel` | `EMAIL` · `SMS` |
| `payload` | `Json` — serialized notification data |
| `status` | `PENDING` → `SENT` · `FAILED` |
| `attempts` | `Int` — retry counter |
| `createdAt` | |

---

## Enums

| Enum | Values |
|---|---|
| `Role` | `customer` · `agent` · `admin` |
| `OrderType` | `B2B` · `B2C` |
| `PaymentType` | `PREPAID` · `COD` |
| `OrderStatus` | `CREATED` · `PICKED_UP` · `IN_TRANSIT` · `OUT_FOR_DELIVERY` · `DELIVERED` · `FAILED` · `RESCHEDULED` |
| `FeeType` | `FLAT` · `PERCENTAGE` |
| `DispatchChannel` | `EMAIL` · `SMS` |
| `DispatchStatus` | `PENDING` · `SENT` · `FAILED` |

---

## Key Constraints

- `ShipmentEvent` rows are **never updated** — source of truth for order history
- `PriceMatrix` is unique per `(fromZoneId, toZoneId, orderType)` 
- `Area.pincode` is unique — one zone per pincode
- `feeSnapshot` on `Order` is frozen at confirm time — pricing config changes don't affect past orders
- `Agent.loadCount` is atomically incremented/decremented inside Prisma transactions
- `Decimal` fields serialize to strings in JSON — always wrap with `Number()` before arithmetic