"use server";

import { prisma } from "@/lib/prisma";

export async function getMyShopViolations(shop_id: string) {
  return await prisma.shopViolation.findMany({
    where: { shop_id },
    orderBy: { created_at: "desc" },
  });
}
