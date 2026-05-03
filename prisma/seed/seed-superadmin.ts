import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma";
import { config } from "dotenv";
import { prisma } from "@/lib/prisma";

config();

const DEFAULT_AVATAR = "default-avatar.jpg";

export async function seedSuperAdmin() {
  console.log("Memulai seeding Super Admin...");

  const superadminUsername = process.env.SUPERADMIN_USERNAME;
  const superadminPassword = process.env.SUPERADMIN_PASSWORD;

  if (!superadminUsername || !superadminPassword) {
    console.error(
      "SUPERADMIN_USERNAME atau SUPERADMIN_PASSWORD tidak ditemukan di .env. Seeding dibatalkan.",
    );
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(superadminPassword, 10);

    await prisma.user.upsert({
      where: { username: superadminUsername },
      update: {
        password: hashedPassword,
        role: Role.SUPERADMIN,
      },
      create: {
        name: "Super Admin",
        username: superadminUsername,
        password: hashedPassword,
        role: Role.SUPERADMIN,
        avatar: DEFAULT_AVATAR,
        admin: {
          create: {},
        },
      },
    });

    console.log(`Super Admin '${superadminUsername}' berhasil di-seed.`);
  } catch (error) {
    console.error("Gagal melakukan seeding Super Admin:", error);
  }
}

if (require.main === module) {
  seedSuperAdmin()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}