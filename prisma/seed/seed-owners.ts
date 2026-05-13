import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma";
import { config } from "dotenv";
import { prisma } from "@/lib/prisma";

config();

const DEFAULT_AVATAR = "avatars/default-avatar.jpg";

export async function seedOwners() {
  console.log("Memulai seeding owners...");

  const ownerPassword = process.env.OWNER_PASSWORD || "password123";

  if (!process.env.OWNER_FIREBASE_UID) {
    console.error(
      "OWNER_FIREBASE_UID tidak ditemukan di environment variables.",
    );
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);

    const ownersToSeed = [
      {
        id: process.env.OWNER_FIREBASE_UID,
        name: "Ahmad Subarjo",
        username: process.env.OWNER_USERNAME,
        password: hashedPassword,
        role: Role.SHOP_OWNER,
        avatar: DEFAULT_AVATAR,
      },
    ];

    for (const ownerData of ownersToSeed) {
      await prisma.user.upsert({
        where: { username: ownerData.username },
        update: {
          name: ownerData.name,
          password: ownerData.password,
          role: ownerData.role,
        },
        create: {
          id: ownerData.id,
          name: ownerData.name,
          username: ownerData.username,
          password: ownerData.password,
          role: ownerData.role,
          avatar: ownerData.avatar,
          owner: {
            create: {},
          },
        },
      });
      console.log(`Owner '${ownerData.username}' berhasil di-seed.`);
    }

    console.log("Seeding owners selesai.");
  } catch (error) {
    console.error("Gagal melakukan seeding owners:", error);
  }
}

if (require.main === module) {
  seedOwners()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
