"use server";

import { prisma } from "@/lib/prisma";

export async function getOrderSummaryForChatBubble(id: string) {
  return await prisma.order.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      total_price: true,
      payment_method: true,
      conversation_id: true,
      status: true,
      shop: {
        select: {
          id: true,
          owner_id: true,
        },
      },
      customer: {
        select: {
          floor: true,
          table_number: true,
        },
      },
      order_items: {
        select: {
          quantity: true,
          subtotal: true,
          product: {
            select: {
              image_url: true,
              name: true,
            },
          },
        },
      },
    },
  });
}
