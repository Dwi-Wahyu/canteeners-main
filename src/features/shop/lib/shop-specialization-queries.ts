"use server";

import { prisma } from "@/lib/prisma";

export async function getAllCategories() {
  return await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getShopSpecializations(shopId: string) {
  const shop = await prisma.shop.findUnique({
    where: {
      id: shopId,
    },
    select: {
      specializations: {
        select: {
          category: true,
        },
      },
    },
  });

  return shop?.specializations.map((s) => s.category) || [];
}
