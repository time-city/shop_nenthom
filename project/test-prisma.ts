import { PrismaClient } from '@prisma/client';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

try {
  const p1 = new PrismaClient({});
  void p1;
  console.log("Empty object works");
} catch(e) {
  console.error("Empty object failed:", getErrorMessage(e));
}
try {
  const p2 = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  } as ConstructorParameters<typeof PrismaClient>[0]);
  void p2;
  console.log("datasourceUrl works");
} catch(e) {
  console.error("datasourceUrl failed:", getErrorMessage(e));
}
