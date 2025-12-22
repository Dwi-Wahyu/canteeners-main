"use server";

import { prisma } from "@/lib/prisma";

export async function getShopComplaints(shopId: string) {
  return await prisma.shopComplaint.findMany({
    where: {
      order: {
        shop_id: shopId,
      },
    },
    include: {
      order: {
        select: {
          id: true,
          total_price: true,
          created_at: true,
          customer: {
            select: {
              user: {
                select: {
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
}
