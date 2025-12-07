import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@/app/generated/prisma";

import { config } from "dotenv";

config();

const prisma = new PrismaClient();

export async function seedShops() {
  console.log("Memulai seeding shop...");
}
