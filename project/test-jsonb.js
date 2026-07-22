const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const result = await prisma.$queryRaw`
    SELECT JSONB_BUILD_OBJECT('createdAt', created_at) AS items 
    FROM orders 
    LIMIT 1
  `;
  console.log(result);
}
run().finally(() => prisma.$disconnect());
