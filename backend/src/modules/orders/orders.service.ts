import { OrderStatus, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { calculateCharge, billableWeight } from '../pricing/pricing.service';
import { validateTransition } from '../../lib/stateMachine';
import { notificationsService } from '../notifications/notifications.service';
import { agentsService } from '../agents/agents.service';
import { createError } from '../../middleware/errorHandler';
import { PricingInput } from '../../types';

// Field mapping (new → old DB col via @map in schema):
//   deliveryStage  → current_status
//   originAddress  → pickup_address
//   originPincode  → pickup_pincode
//   destinationAddress → drop_address
//   destinationPincode → drop_pincode
//   priceMatrixId  → rate_card_id
//   feeSnapshot    → applied_rate_snapshot
//   codFee         → cod_surcharge
//   shipmentEvents → trackingHistory (relation)

export const ordersService = {
  async preview(input: PricingInput) {
    return calculateCharge(input);
  },

  async confirm(input: PricingInput & {
    customerId: string;
    createdById: string;
    originAddress: string;
    destinationAddress: string;
  }) {
    // Re-run pricing server-side — never trust client-sent price
    const breakdown = await calculateCharge(input);
    const bWeight = billableWeight(input.lengthCm, input.breadthCm, input.heightCm, input.actualWeightKg);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId:          input.customerId,
          createdById:         input.createdById,
          originAddress:       input.originAddress ?? (input as any).pickupAddress,
          originPincode:       input.pickupPincode,
          originZoneId:        breakdown.fromZoneId,
          destinationAddress:  input.destinationAddress ?? (input as any).dropAddress,
          destinationPincode:  input.dropPincode,
          destinationZoneId:   breakdown.toZoneId,
          lengthCm:            input.lengthCm,
          breadthCm:           input.breadthCm,
          heightCm:            input.heightCm,
          actualWeightKg:      input.actualWeightKg,
          volumetricWeightKg:  bWeight,
          orderType:           input.orderType,
          paymentType:         input.paymentType,
          priceMatrixId:       breakdown.rateCardId,
          feeSnapshot:         breakdown as object,
          codFee:              breakdown.codSurcharge,
          charge:              breakdown.total,
          deliveryStage:       'CREATED',
        },
      });

      // Append-only shipment event
      await tx.shipmentEvent.create({
        data: {
          orderId:       newOrder.id,
          prevStage:     null,
          nextStage:     'CREATED',
          changedById:   input.createdById,
          changedByRole: 'customer',
        },
      });

      return newOrder;
    });

    try {
      const customer = await prisma.user.findUnique({ where: { id: input.customerId } });
      if (customer) {
        await notificationsService.enqueueForOrder(order.id, 'CREATED', customer.email);
      }
    } catch (notifErr) {
      console.warn('[Notifications] Failed to enqueue on create:', notifErr);
    }

    return order;
  },

  async getOrders(userId: string, role: Role, filters: { status?: string; zoneId?: string; agentId?: string; limit?: number }) {
    const where: Record<string, unknown> = {};

    if (role === 'customer') where.customerId = userId;
    else if (role === 'agent') {
      const agent = await prisma.agent.findUnique({ where: { userId } });
      if (agent) where.assignedAgentId = agent.id;
    }

    if (filters.status) {
      if (typeof filters.status === 'string' && filters.status.includes(',')) {
        where.deliveryStage = { in: filters.status.split(',') as OrderStatus[] };
      } else {
        where.deliveryStage = filters.status;
      }
    }
    if (filters.zoneId)  where.originZoneId   = filters.zoneId;
    if (filters.agentId) where.assignedAgentId = filters.agentId;

    return prisma.order.findMany({
      where,
      include: {
        customer:      { select: { name: true, email: true } },
        originZone:    true,
        destinationZone: true,
        assignedAgent: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit,
    });
  },

  async getOrderById(orderId: string, userId: string, role: Role) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer:       { select: { name: true, email: true, phone: true } },
        originZone:     true,
        destinationZone: true,
        assignedAgent:  { include: { user: { select: { name: true, email: true, phone: true } } } },
        shipmentEvents: {
          orderBy: { createdAt: 'asc' },
          include: { changedBy: { select: { name: true, role: true } } },
        },
      },
    });

    if (!order) throw createError('Order not found', 404);
    if (role === 'customer' && order.customerId !== userId) throw createError('Forbidden', 403);

    return order;
  },

  async updateStatus(orderId: string, toStatus: OrderStatus, actorId: string, actorRole: Role, notes?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } });
    if (!order) throw createError('Order not found', 404);

    // Agent can only update their assigned order
    if (actorRole === 'agent') {
      const agent = await prisma.agent.findUnique({ where: { userId: actorId } });
      if (!agent || order.assignedAgentId !== agent.id) throw createError('Forbidden', 403);
    }

    const isValid = validateTransition(order.deliveryStage as OrderStatus, toStatus);
    if (!isValid) {
      throw createError(`Invalid transition: ${order.deliveryStage} → ${toStatus}`, 409);
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { deliveryStage: toStatus, updatedAt: new Date() },
      });

      await tx.shipmentEvent.create({
        data: {
          orderId,
          prevStage:     order.deliveryStage as OrderStatus,
          nextStage:     toStatus,
          changedById:   actorId,
          changedByRole: actorRole,
          notes,
        },
      });

      // Free up agent slot when order reaches terminal state
      if ((toStatus === 'DELIVERED' || toStatus === 'FAILED') && order.assignedAgentId) {
        await tx.agent.update({
          where: { id: order.assignedAgentId },
          data: { loadCount: { decrement: 1 } },
        });
      }
    });

    try {
      await notificationsService.enqueueForOrder(orderId, toStatus, order.customer.email);
    } catch (notifErr) {
      console.warn('[Notifications] Failed to enqueue — status update still succeeded:', notifErr);
    }

    return { success: true, newStatus: toStatus };
  },

  async reschedule(orderId: string, customerId: string, rescheduleDate: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw createError('Order not found', 404);
    if (order.customerId !== customerId) throw createError('Forbidden', 403);
    if (order.deliveryStage !== 'FAILED') throw createError('Can only reschedule a failed order', 422);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { deliveryStage: 'RESCHEDULED', rescheduledFor: new Date(rescheduleDate) },
      });

      await tx.shipmentEvent.create({
        data: {
          orderId,
          prevStage:     'FAILED',
          nextStage:     'RESCHEDULED',
          changedById:   customerId,
          changedByRole: 'customer',
          notes: `Rescheduled for ${rescheduleDate}`,
        },
      });
    });

    try {
      await agentsService.autoAssign(orderId, order.originZoneId ?? (order as any).pickupZoneId);
    } catch {
      console.warn(`[Reschedule] Auto-assignment failed for order ${orderId} — requires manual assignment`);
    }

    return { success: true };
  },

  async autoAssign(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw createError('Order not found', 404);
    const agentId = await agentsService.autoAssign(orderId, order.originZoneId ?? (order as any).pickupZoneId);
    return { agentId };
  },

  async manualAssign(orderId: string, agentId: string, actorId: string, actorRole: Role) {
    return agentsService.manualAssign(orderId, agentId, actorId, actorRole);
  },
};