import { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';
import { notificationsService } from '../notifications/notifications.service';

// Fields updated:
//   clockedIn       → onShift
//   activeOrderCount→ loadCount
//   maxCapacity     → slotLimit
// orderTrackingHistory → shipmentEvent
// fromStatus/toStatus  → prevStage/nextStage
// actorId/actorRole    → changedById/changedByRole

export const agentsService = {
  async getAll() {
    return prisma.agent.findMany({
      include: { user: { select: { id: true, name: true, email: true, phone: true } }, zone: true },
    });
  },

  async clockIn(agentId: string) {
    return prisma.agent.update({ where: { id: agentId }, data: { onShift: true } });
  },

  async clockOut(agentId: string) {
    return prisma.agent.update({ where: { id: agentId }, data: { onShift: false } });
  },

  async updateLocation(agentId: string, lat: number, lng: number) {
    return prisma.agent.update({
      where: { id: agentId },
      data: { currentLat: lat, currentLng: lng },
    });
  },

  async getAgentByUserId(userId: string) {
    return prisma.agent.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  /**
   * Auto-assign: find nearest available agent.
   * Uses zone matching + raw SQL with FOR UPDATE SKIP LOCKED for concurrency safety.
   */
  async autoAssign(orderId: string, pickupZoneId: string): Promise<string> {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { customer: true } });
      if (!order) throw createError('Order not found', 404);
      if (order.assignedAgentId) throw createError('Order already assigned', 409);

      // Raw query uses actual DB column names (unchanged via @map)
      const agents = await tx.$queryRaw<Array<{ id: string; active_order_count: number }>>`
        SELECT id, active_order_count
        FROM agents
        WHERE clocked_in = true
          AND active_order_count < max_capacity
          AND (zone_id = ${pickupZoneId} OR zone_id IS NOT NULL)
        ORDER BY
          CASE WHEN zone_id = ${pickupZoneId} THEN 0 ELSE 1 END,
          active_order_count ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `;

      if (!agents || agents.length === 0) {
        throw createError('No available agents at this time', 503);
      }

      const agent = agents[0];

      // Atomically increment load count and assign
      await tx.agent.update({
        where: { id: agent.id },
        data: { loadCount: { increment: 1 } },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { assignedAgentId: agent.id },
      });

      try {
        await notificationsService.enqueueForOrder(orderId, 'AGENT_ASSIGNED', order.customer.email);
      } catch (e) {
        console.warn('Failed to enqueue auto-assign notification:', e);
      }

      return agent.id;
    });
  },

  /**
   * Manually assign a specific agent to an order.
   * Records an audit trail entry in the shipment events log.
   */
  async manualAssign(orderId: string, agentId: string, actorId: string, actorRole: Role) {
    return prisma.$transaction(async (tx) => {
      const agent = await tx.agent.findUnique({ where: { id: agentId } });
      if (!agent) throw createError('Agent not found', 404);
      if (!agent.onShift) throw createError('Agent is not on shift', 422);
      if (agent.loadCount >= agent.slotLimit) throw createError('Agent at full capacity', 422);

      const order = await tx.order.findUnique({ where: { id: orderId }, include: { customer: true } });
      if (!order) throw createError('Order not found', 404);

      // Decrement old agent's load count if reassigning
      if (order.assignedAgentId && order.assignedAgentId !== agentId) {
        await tx.agent.update({
          where: { id: order.assignedAgentId },
          data: { loadCount: { decrement: 1 } },
        });
      }

      await tx.agent.update({
        where: { id: agentId },
        data: { loadCount: { increment: 1 } },
      });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { assignedAgentId: agentId },
      });

      // Record shipment event audit trail
      await tx.shipmentEvent.create({
        data: {
          orderId,
          prevStage:    order.deliveryStage,
          nextStage:    order.deliveryStage,
          changedById:  actorId,
          changedByRole: actorRole,
          notes: `Shipment manually assigned to agent`,
        },
      });

      try {
        await notificationsService.enqueueForOrder(orderId, 'AGENT_ASSIGNED', order.customer.email);
      } catch (e) {
        console.warn('Failed to enqueue manual assign notification:', e);
      }

      return updatedOrder;
    });
  },
};