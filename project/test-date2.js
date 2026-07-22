const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { created_at: { gte: start, lte: now } }
  });
  console.log("Orders found:", orders.length);
  orders.forEach(o => {
    console.log(" - id:", o.id, "created_at:", o.created_at, "local:", new Date(o.created_at).getHours());
  });
}
run().catch(console.error).finally(() => prisma.$disconnect());
