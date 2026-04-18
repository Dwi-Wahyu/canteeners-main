import { generateCategorySlug } from "@/helper/generate-category-slug";
import { prisma } from "@/lib/prisma";

export async function seedCategories() {
  console.log("Memulai seeding kategori...");
  try {
    const categories = [
      {
        name: "Es Buah",
        image_url: "es-buah.jpg",
      },
      {
        name: "Ayam Geprek",
        image_url: "ayam-geprek.jpg",
      },
      {
        name: "Gorengan",
        image_url: "gorengan.jpg",
      },
    ];

    for (const category of categories) {
      await prisma.category.create({
        data: {
          name: category.name,
          image_url: category.image_url,
          slug: generateCategorySlug(category.name),
        },
      });
    }
  } catch (error) {
    console.error("Gagal melakukan seeding kantin:", error);
  }
}
