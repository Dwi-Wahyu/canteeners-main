import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { config } from "dotenv";

config();

export async function seedShops() {
  console.log("Memulai seeding shops...");

  const ownerPassword = process.env.OWNER_PASSWORD;
  const ownerUsername = process.env.OWNER_USERNAME;
  const ownerFirebaseUid = process.env.OWNER_FIREBASE_UID;

  if (!ownerPassword || !ownerUsername || !ownerFirebaseUid) {
    console.error(
      "Variabel lingkungan owner tidak ditemukan. Seeding shop dibatalkan.",
    );
    return;
  }

  try {
    const hashedPassword = bcrypt.hashSync(ownerPassword, 10);

    const user = await prisma.user.upsert({
      where: { username: ownerUsername },
      update: {
        name: "Ahmad Subarjo",
        password: hashedPassword,
        role: "SHOP_OWNER",
      },
      create: {
        id: ownerFirebaseUid,
        name: "Ahmad Subarjo",
        username: ownerUsername,
        password: hashedPassword,
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
                payments: {
                  create: {
                    method: "CASH",
                    active: true,
                  },
                },
                products: {
                  create: [
                    {
                      name: "Ayam Geprek Sambal Bawang",
                      description: "Ayam goreng tepung dengan sambal bawang pedas nampol",
                      image_url: "ayam-geprek.jpg",
                      price: 15000,
                      categories: {
                        create: {
                          category: {
                            connect: {
                              slug: "ayam-geprek",
                            },
                          },
                        },
                      },
                    },
                    {
                      name: "Es Buah Segar",
                      description: "Campuran buah-buahan segar dengan sirup dan susu",
                      image_url: "es-buah.jpg",
                      price: 10000,
                      categories: {
                        create: {
                          category: {
                            connect: {
                              slug: "es-buah",
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      include: {
        owner: {
          include: {
            shop: true,
          },
        },
      },
    });

    // Jika update, kita tambahkan payment dan product secara manual jika belum ada
    if (user.owner?.shop) {
      const shopId = user.owner.shop.id;

      await prisma.payment.upsert({
        where: {
          shop_id_method: {
            shop_id: shopId,
            method: "CASH",
          },
        },
        update: { active: true },
        create: {
          shop_id: shopId,
          method: "CASH",
          active: true,
        },
      });

      console.log(`Payment method CASH untuk '${user.owner.shop.name}' berhasil di-seed.`);
    }

    console.log(`Owner '${ownerUsername}' dan Shop 'Kedai Subarjo' berhasil di-seed.`);
    console.log("Seeding shops selesai.");
  } catch (error) {
    console.error("Gagal melakukan seeding shops:", error);
  }
}
