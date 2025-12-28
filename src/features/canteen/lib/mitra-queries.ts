import { prisma } from "@/lib/prisma";

export async function getJoinedShops() {
  return await prisma.shop.findMany({
    where: {
      status: "ACTIVE",
    },
    take: 6,
    orderBy: {
      total_ratings: "desc",
    },
    include: {
      canteen: true,
    },
  });
}
