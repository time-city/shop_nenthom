const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const order = await prisma.order.findFirst({
      where: { order_number: "DH-MRBOPLEB-4283" },
      select: {
        shipping_carrier: true,
        tracking_code: true
      }
    });
    console.log("Success:", order);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
