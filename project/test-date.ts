import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  
  console.log("now:", now.toISOString())
  console.log("start:", start.toISOString())
  console.log("start local:", start.toString())

  const orders = await prisma.order.findMany({
    where: {
      created_at: {
        gte: start,
        lte: now
      }
    },
    select: { id: true, created_at: true }
  })
  
  console.log("Orders found today:", orders.length)
  if (orders.length > 0) {
     console.log(orders)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
