import { generateCategorySlug } from "@/helper/generate-category-slug";
import { prisma } from "@/lib/prisma";

export async function seedCanteens() {
  console.log("Memulai seeding kantin...");
  try {
    await prisma.canteen.createMany({
      data: [
        {
          name: "Kantin Kudapan",
          image_url: "kudapan.webp",
          slug: generateCategorySlug("Kantin Kudapan"),
        },
        {
          name: "Kantin Sastra",
          image_url: "kansas.jpeg",
          slug: generateCategorySlug("Kantin Sastra"),
        },
        {
          name: "Kantin Sosiologi",
          image_url: "kansos.webp",
          slug: generateCategorySlug("Kantin Sosiologi"),
        },
      ],
    });

    await prisma.canteen.update({
      where: {
        slug: "kantin-kudapan",
      },
      data: {
        maps: {
          createMany: {
            data: [
              {
                floor: 1,
                image_url: "kudapan-lantai-1.png",
              },
              {
                floor: 2,
                image_url: "kudapan-lantai-2.png",
              },
            ],
          },
        },
      },
    });
  } catch (error) {
    console.error("Gagal melakukan seeding kantin:", error);
  }
}
