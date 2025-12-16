"use server";

import { prisma } from "@/lib/prisma";

export async function getOrderSummaryForChatBubble(id: string) {
  return await prisma.order.findFirst({
    where: {
      id,
    },
    select: {
      total_price: true,
      payment_method: true,
      order_items: {
        select: {
          quantity: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}
