const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const orders = await prisma.order.findMany({
    orderBy: { created_at: 'desc' },
    take: 5
  });
  console.log("Recent 5 orders:");
  orders.forEach(o => console.log(o.id, o.created_at, o.created_at.toISOString()));
}
run().finally(() => prisma.$disconnect());
