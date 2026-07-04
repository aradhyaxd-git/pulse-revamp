// src/types/models.ts
// All types are aligned with the Prisma schema and backend API responses.
// Field names reflect the revamped Pulse Delivery naming.

// ─── Enums ───────────────────────────────────────────────────────────────────

/** Matches the Prisma Role enum (lowercase, as stored and returned by the backend). */
export type Role = 'customer' | 'agent' | 'admin';

/** Matches the Prisma OrderStatus enum exactly. */
export type OrderStatus =
  | 'CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RESCHEDULED';

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  createdAt?: string;
}

/**
 * Matches the Prisma Order model + included relations.
 * NOTE: Decimal fields are serialised as strings by Prisma JSON.
 * Always wrap with Number() before arithmetic.
 */
export interface Order {
  id: string;
  /** Unique human-readable shipment code (was trackingId) */
  shipmentCode?: string | null;
  customerId: string;
  createdById: string;
  /** Origin / pickup address */
  originAddress: string;
  originPincode: string;
  originZoneId: string;
  /** Destination / drop address */
  destinationAddress: string;
  destinationPincode: string;
  destinationZoneId: string;
  lengthCm: string | number;
  breadthCm: string | number;
  heightCm: string | number;
  actualWeightKg: string | number;
  /** Chargeable / billable weight */
  chargeableWeightKg: string | number;
  orderType: 'B2B' | 'B2C';
  paymentType: 'PREPAID' | 'COD';
  priceMatrixId?: string | null;
  pricingSnapshot?: any;
  codFee: string | number;
  charge: string | number;
  /** Current delivery lifecycle stage (was currentStatus) */
  deliveryStage: OrderStatus;
  assignedAgentId?: string | null;
  /** Rescheduled delivery date (was rescheduleDate) */
  deferredDate?: string | null;
  createdAt: string;
  updatedAt: string;

  // Included relations (present in getOrders & getOrderById responses)
  customer?: { name: string; email: string; phone?: string | null };
  originZone?: { id: string; name: string };
  destinationZone?: { id: string; name: string };
  assignedAgent?: {
    id: string;
    user: { name: string; email: string; phone?: string | null };
  } | null;
  shipmentEvents?: ShipmentEvent[];

  // Legacy aliases for backward compatibility during migration
  trackingId?: string | null;
  currentStatus?: OrderStatus;
  pickupAddress?: string;
  pickupPincode?: string;       // legacy — use originPincode on new code
  pickupZoneId?: string;
  dropAddress?: string;
  dropPincode?: string;         // legacy — use destinationPincode on new code
  dropZoneId?: string;
  billableWeightKg?: string | number;
  appliedRateSnapshot?: any;
  codSurcharge?: string | number;
  rescheduleDate?: string | null;
  trackingHistory?: ShipmentEvent[];
  pickupZone?: { id: string; name: string };
  dropZone?: { id: string; name: string };
  rateCardId?: string | null;
}

/**
 * Matches the Prisma ShipmentEvent model (was OrderTrackingHistory).
 */
export interface ShipmentEvent {
  id: string;
  orderId: string;
  /** Previous delivery stage (was fromStatus) */
  prevStage: OrderStatus | null;
  /** New delivery stage (was toStatus) */
  nextStage: OrderStatus;
  /** ID of the user who made the change (was actorId) */
  changedById: string;
  /** Role of the user who made the change (was actorRole) */
  changedByRole: Role;
  notes?: string | null;
  createdAt: string;
  changedBy?: { name: string; role: Role };

  // Legacy aliases
  fromStatus?: OrderStatus | null;
  toStatus?: OrderStatus;
  actorId?: string;
  actorRole?: Role;
  actor?: { name: string; role: Role };
}

/**
 * Used by the Timeline component. Aliased from ShipmentEvent for clarity.
 */
export type TimelineEvent = ShipmentEvent;

/**
 * Matches the Prisma Agent model + user / zone includes.
 */
export interface Agent {
  id: string;
  userId: string;
  zoneId?: string | null;
  currentLat?: number | null;
  currentLng?: number | null;
  /** Whether agent is currently on shift (was clockedIn) */
  onShift: boolean;
  /** Number of active orders currently assigned (was activeOrderCount) */
  loadCount: number;
  /** Max orders the agent can handle at once (was maxCapacity) */
  slotLimit: number;
  updatedAt: string;

  // Included relations
  user?: { id: string; name: string; email: string; phone?: string | null };
  zone?: { id: string; name: string } | null;

  // Legacy aliases
  clockedIn?: boolean;
  activeOrderCount?: number;
  maxCapacity?: number;
}

/**
 * Matches the Prisma Zone model + areas include.
 */
export interface Zone {
  id: string;
  name: string;
  areas?: Area[];
}

/**
 * Matches the Prisma Area model.
 * NOTE: `pincode` is the primary key, not a separate `id`.
 */
export interface Area {
  pincode: string;
  zoneId: string;
  zone?: { id: string; name: string };
}

/**
 * Matches the Prisma PriceMatrix model (was RateCard) + zone includes.
 */
export interface PriceMatrix {
  id: string;
  fromZoneId: string;
  toZoneId: string;
  orderType: 'B2B' | 'B2C';
  /** Price per kg (was ratePerKg) */
  pricePerKg: string | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fromZone?: { id: string; name: string };
  toZone?: { id: string; name: string };
}

/** Legacy alias so existing code that imports RateCard still works */
export type RateCard = PriceMatrix & { ratePerKg?: string | number };

/**
 * Returned by POST /orders/preview → response.breakdown
 */
export interface PriceBreakdown {
  fromZoneId: string;
  fromZoneName: string;
  toZoneId: string;
  toZoneName: string;
  rateCardId: string;
  ratePerKg: number;
  billableWeight: number;
  base: number;
  codSurcharge: number;
  surchargeType?: string;
  surchargeValue?: number;
  total: number;
}