import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { prisma } from '../../lib/prisma';

export const trackingController = {
  async getTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Model renamed: orderTrackingHistory → shipmentEvent
      // Relation renamed: actor → changedBy
      const events = await prisma.shipmentEvent.findMany({
        where:   { orderId: req.params.id as string },
        orderBy: { createdAt: 'asc' },
        include: {
          changedBy: { select: { name: true, role: true } },
        },
      });
      res.json({ timeline: events });
    } catch (err) { next(err); }
  },
};