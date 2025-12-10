"use server";

import { prisma } from "@/lib/prisma";

export async function getCanteenBySlug(slug: string) {
  return await prisma.canteen.findUnique({
    where: { slug },
    include: {
      shops: {
        select: {
          id: true,
          image_url: true,
          name: true,
          minimum_price: true,
          maximum_price: true,
          average_rating: true,
          total_ratings: true,
          owner: {
            select: {
              user_id: true,
            },
          },
        },
      },
    },
  });
}
