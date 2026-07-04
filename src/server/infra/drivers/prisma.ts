import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

const prisma = new PrismaClient({
  datasources: { db: { url: env.databaseUrl } }
});

export { prisma };
