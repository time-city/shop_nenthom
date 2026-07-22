import prisma from "../src/lib/prisma"; async function main() { await prisma.orderItem.deleteMany(); await prisma.order.deleteMany(); console.log("Orders cleared!"); } main().catch(console.error);
