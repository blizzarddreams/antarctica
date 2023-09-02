import { Prisma, PrismaClient } from "@prisma/client";

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient;
    }
  }
}

const prisma: PrismaClient = new PrismaClient();

export default prisma;
