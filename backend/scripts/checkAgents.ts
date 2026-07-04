import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const order = await prisma.order.findFirst();
  if (!order) {
    console.log('No orders');
    return;
  }
  const pickupZoneId = order.pickupZoneId;
  
  try {
    const agents = await prisma.$queryRaw<Array<any>>`
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
    console.log('Query result:', agents);
  } catch (e) {
    console.error('Query Error:', e);
  }
}

check().then(() => process.exit(0));
