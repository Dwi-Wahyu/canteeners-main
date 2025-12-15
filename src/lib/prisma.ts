import { PrismaClient } from "@/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
});

export const prismaAccelerate = prisma.$extends(withAccelerate());
