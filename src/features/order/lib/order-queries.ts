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

export async function getOrderDetail(id: string) {
  return await prisma.order.findFirst({
    where: {
      id,
    },
    include: {
      order_items: {
        select: {
          quantity: true,
          price_at_add: true,
          subtotal: true,
          note: true,
          product: {
            select: {
              name: true,
              image_url: true,
            },
          },
        },
      },
      shop: {
        select: {
          canteen: {
            select: {
              id: true,
              name: true,
            },
          },
          name: true,
          owner_id: true,
        },
      },
      testimony: true,
      customer: {
        select: {
          table_number: true,
          floor: true,

          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });
}
