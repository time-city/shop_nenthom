import { PrismaClient } from '@prisma/client';
try {
  const p1 = new PrismaClient({});
  console.log("Empty object works");
} catch(e) {
  console.error("Empty object failed:", e.message);
}
try {
  const p2 = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
  console.log("datasourceUrl works");
} catch(e) {
  console.error("datasourceUrl failed:", e.message);
}
