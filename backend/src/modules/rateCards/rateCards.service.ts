import { OrderType, FeeType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { cacheDel, cacheGet, cacheSet } from '../../lib/redis';
import { createError } from '../../middleware/errorHandler';

// Service now uses: prisma.priceMatrix (was rateCard) and prisma.codFeeConfig (was codSurchargeConfig)
// Field: pricePerKg (was ratePerKg) — mapped to same DB column via @map

export const rateCardsService = {
  async getAll() {
    return prisma.priceMatrix.findMany({
      where: { isActive: true },
      include: { fromZone: true, toZone: true },
    });
  },

  async create(data: { fromZoneId: string; toZoneId: string; orderType: OrderType; pricePerKg: number }) {
    const card = await prisma.priceMatrix.upsert({
      where: {
        fromZoneId_toZoneId_orderType: {
          fromZoneId: data.fromZoneId,
          toZoneId:   data.toZoneId,
          orderType:  data.orderType,
        },
      },
      create: data,
      update: { pricePerKg: data.pricePerKg, updatedAt: new Date() },
    });
    await cacheDel(`rate:${data.fromZoneId}:${data.toZoneId}:${data.orderType}`);
    return card;
  },

  async update(id: string, pricePerKg: number) {
    const existing = await prisma.priceMatrix.findUnique({ where: { id } });
    if (!existing) throw createError('Price matrix entry not found', 404);

    const card = await prisma.priceMatrix.update({
      where: { id },
      data: { pricePerKg, updatedAt: new Date() },
    });

    await cacheDel(`rate:${existing.fromZoneId}:${existing.toZoneId}:${existing.orderType}`);
    return card;
  },

  async getRateCard(fromZoneId: string, toZoneId: string, orderType: OrderType) {
    const cacheKey = `rate:${fromZoneId}:${toZoneId}:${orderType}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const card = await prisma.priceMatrix.findFirst({
      where: { fromZoneId, toZoneId, orderType, isActive: true },
    });
    if (!card) throw createError(`No active price matrix for this zone pair and order type`, 422);

    await cacheSet(cacheKey, JSON.stringify(card), 3600);
    return card;
  },

  async getCodSurcharges() {
    return prisma.codFeeConfig.findMany();
  },

  async upsertCodSurcharge(data: { orderType: OrderType; type: FeeType; value: number }) {
    const config = await prisma.codFeeConfig.upsert({
      where:  { orderType: data.orderType },
      create: data,
      update: { type: data.type, value: data.value },
    });
    await cacheDel(`cod:${data.orderType}`);
    return config;
  },

  async getCodSurcharge(orderType: OrderType) {
    const cacheKey = `cod:${orderType}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    const config = await prisma.codFeeConfig.findUnique({ where: { orderType } });
    if (config) await cacheSet(cacheKey, JSON.stringify(config), 3600);
    return config;
  },
};