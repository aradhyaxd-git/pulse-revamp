import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding Pulse Delivery database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@delivery.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@delivery.com', passwordHash: adminHash, role: 'admin' },
  });

  const custHash = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where:  { email: 'customer@test.com' },
    update: {},
    create: { name: 'Test Customer', email: 'customer@test.com', phone: '8948720900', passwordHash: custHash, role: 'customer' },
  });

  // ── Coverage Zones ─────────────────────────────────────────────────────────
  const zoneA = await prisma.zone.upsert({ where: { name: 'Zone A - North' }, update: {}, create: { name: 'Zone A - North' } });
  const zoneB = await prisma.zone.upsert({ where: { name: 'Zone B - South' }, update: {}, create: { name: 'Zone B - South' } });
  const zoneC = await prisma.zone.upsert({ where: { name: 'Zone C - East'  }, update: {}, create: { name: 'Zone C - East'  } });
  const zoneD = await prisma.zone.upsert({ where: { name: 'Zone D - West'  }, update: {}, create: { name: 'Zone D - West'  } });

  // ── Service Pincodes (Areas) ───────────────────────────────────────────────
  const areas = [
    { pincode: '110001', zoneId: zoneA.id },
    { pincode: '110002', zoneId: zoneA.id },
    { pincode: '400001', zoneId: zoneB.id },
    { pincode: '400002', zoneId: zoneB.id },
    { pincode: '700001', zoneId: zoneC.id },
    { pincode: '700002', zoneId: zoneC.id },
    { pincode: '800001', zoneId: zoneD.id },
    { pincode: '800002', zoneId: zoneD.id },
  ];
  for (const area of areas) {
    await prisma.area.upsert({ where: { pincode: area.pincode }, update: {}, create: area });
  }

  // ── Price Matrix (was RateCard) ────────────────────────────────────────────
  // New model: PriceMatrix, field: pricePerKg (mapped to rate_per_kg in DB)
  const rateConfigs = [
    { fromZoneId: zoneA.id, toZoneId: zoneA.id, orderType: 'B2C' as const, pricePerKg: 30 },
    { fromZoneId: zoneA.id, toZoneId: zoneA.id, orderType: 'B2B' as const, pricePerKg: 25 },
    { fromZoneId: zoneA.id, toZoneId: zoneB.id, orderType: 'B2C' as const, pricePerKg: 50 },
    { fromZoneId: zoneA.id, toZoneId: zoneB.id, orderType: 'B2B' as const, pricePerKg: 40 },
    { fromZoneId: zoneB.id, toZoneId: zoneA.id, orderType: 'B2C' as const, pricePerKg: 50 },
    { fromZoneId: zoneB.id, toZoneId: zoneA.id, orderType: 'B2B' as const, pricePerKg: 40 },
    { fromZoneId: zoneB.id, toZoneId: zoneB.id, orderType: 'B2C' as const, pricePerKg: 30 },
    { fromZoneId: zoneB.id, toZoneId: zoneB.id, orderType: 'B2B' as const, pricePerKg: 25 },
    { fromZoneId: zoneA.id, toZoneId: zoneC.id, orderType: 'B2C' as const, pricePerKg: 60 },
    { fromZoneId: zoneA.id, toZoneId: zoneC.id, orderType: 'B2B' as const, pricePerKg: 48 },
    { fromZoneId: zoneB.id, toZoneId: zoneC.id, orderType: 'B2C' as const, pricePerKg: 55 },
    { fromZoneId: zoneB.id, toZoneId: zoneC.id, orderType: 'B2B' as const, pricePerKg: 45 },
    { fromZoneId: zoneC.id, toZoneId: zoneA.id, orderType: 'B2C' as const, pricePerKg: 60 },
    { fromZoneId: zoneC.id, toZoneId: zoneA.id, orderType: 'B2B' as const, pricePerKg: 48 },
    { fromZoneId: zoneC.id, toZoneId: zoneB.id, orderType: 'B2C' as const, pricePerKg: 55 },
    { fromZoneId: zoneC.id, toZoneId: zoneB.id, orderType: 'B2B' as const, pricePerKg: 45 },
    { fromZoneId: zoneC.id, toZoneId: zoneC.id, orderType: 'B2C' as const, pricePerKg: 30 },
    { fromZoneId: zoneC.id, toZoneId: zoneC.id, orderType: 'B2B' as const, pricePerKg: 25 },
    { fromZoneId: zoneD.id, toZoneId: zoneD.id, orderType: 'B2C' as const, pricePerKg: 30 },
    { fromZoneId: zoneD.id, toZoneId: zoneD.id, orderType: 'B2B' as const, pricePerKg: 25 },
  ];

  for (const rc of rateConfigs) {
    await prisma.priceMatrix.upsert({
      where: {
        fromZoneId_toZoneId_orderType: {
          fromZoneId: rc.fromZoneId,
          toZoneId:   rc.toZoneId,
          orderType:  rc.orderType,
        },
      },
      update: {},
      create: rc,
    });
  }

  // ── COD Fee Config (was CodSurchargeConfig) ───────────────────────────────
  await prisma.codFeeConfig.upsert({
    where:  { orderType: 'B2C' },
    update: {},
    create: { orderType: 'B2C', type: 'PERCENTAGE', value: 2 },
  });
  await prisma.codFeeConfig.upsert({
    where:  { orderType: 'B2B' },
    update: {},
    create: { orderType: 'B2B', type: 'FLAT', value: 50 },
  });

  // ── Agent user ─────────────────────────────────────────────────────────────
  // Agent fields: onShift (was clockedIn), slotLimit (was maxCapacity), loadCount (was activeOrderCount)
  const agentHash = await bcrypt.hash('agent123', 12);
  const agentUser = await prisma.user.upsert({
    where:  { email: 'agent@delivery.com' },
    update: {},
    create: {
      name:         'Test Agent',
      email:        'agent@delivery.com',
      phone:        '8738749823',
      passwordHash: agentHash,
      role:         'agent',
      agent: {
        create: {
          zoneId:     zoneA.id,
          currentLat: 28.6139,
          currentLng: 77.2090,
          onShift:    true,      // was: clockedIn
          slotLimit:  5,         // was: maxCapacity
          loadCount:  0,         // was: activeOrderCount
        },
      },
    },
  });

  console.log('\n✅  Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤  Admin    → ${admin.email}    / admin123`);
  console.log(`📦  Customer → ${customer.email}   / customer123`);
  console.log(`🚗  Agent    → ${agentUser.email}   / agent123`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🗺️   Zones: A-North, B-South, C-East, D-West`);
  console.log(`📮  Pincodes: 110001, 110002, 400001, 400002, 700001, 700002, 800001, 800002`);
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());