import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@/app/generated/prisma";

import { config } from "dotenv";

config();

const prisma = new PrismaClient();

export async function seedShops() {
  console.log("Memulai seeding shop...");

  try {
    await prisma.user.create({
      data: {
        name: "Ahmad Subarjo",
        username: process.env.OWNER_USERNAME,
        password: bcrypt.hashSync(process.env.OWNER_PASSWORD!),
        role: "SHOP_OWNER",
        owner: {
          create: {
            shop: {
              create: {
                name: "Kedai Subarjo",
                image_url: "shops/kedai-subarjo.webp",
                canteen: {
                  connect: {
                    slug: "kantin-kudapan",
                  },
                },
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
}
