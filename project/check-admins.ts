import 'dotenv/config';
import prisma from './src/lib/prisma';

async function main() {
  const clients = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: { email: true, role: true },
    take: 2
  });
  console.log('Clients in DB:', clients);
}

main().finally(() => prisma.$disconnect());
