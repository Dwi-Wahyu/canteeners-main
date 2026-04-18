import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma";

import { config } from "dotenv";
import { prisma } from "@/lib/prisma";

config();

const DEFAULT_AVATAR = "default-avatar.jpg";

export async function seedUsers() {
  console.log("Memulai seeding users...");

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error(
      "Variabel lingkungan tidak ditemukan. Seeding admin dibatalkan.",
    );
    await prisma.$disconnect();
    return;
  }

  try {
    const hashedPasswordAdmin = await bcrypt.hash(adminPassword, 10);

    const usersToSeed = [];

    await prisma.user.create({
      data: {
        id: process.env.OWNER_FIREBASE_UID,
        name: "Ahmad Subarjo",
        username: process.env.OWNER_USERNAME,
        password: bcrypt.hashSync(process.env.OWNER_PASSWORD!),
        role: "SHOP_OWNER",
        owner: {
          create: {
            shop: {
              create: {
                name: "Kedai Subarjo",
                image_url: "kedai-subarjo.webp",
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

    usersToSeed.push({
      name: "Administrator",
      username: "admin",
      password: hashedPasswordAdmin,
      role: Role.ADMIN,
      avatar: DEFAULT_AVATAR,
    });

    const userCreationPromises = usersToSeed.map(async (userData) => {
      await prisma.user.upsert({
        where: { username: userData.username },
        update: {
          name: userData.name,
          password: userData.password,
          role: userData.role,
        },
        create: {
          name: userData.name,
          username: userData.username,
          password: userData.password,
          role: userData.role,
          avatar: userData.avatar,
          ...(userData.role === "ADMIN"
            ? {
                admin: {
                  create: {},
                },
              }
            : {
                owner: {
                  create: {},
                },
              }),
        },
      });

      console.log(`Pengguna '${userData.username}' berhasil di-seed.`);
    });

    await Promise.all(userCreationPromises);

    console.log("Seeding users selesai.");
  } catch (error) {
    console.error("Gagal melakukan seeding users:", error);
  }
}
