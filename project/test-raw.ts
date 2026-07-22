import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  
  console.log("start:", start)
  const result = await prisma.$queryRaw`SELECT ${start}::text as start_str`
  console.log("Prisma passes it as:", result)
}
main().catch(console.error).finally(() => prisma.$disconnect())
