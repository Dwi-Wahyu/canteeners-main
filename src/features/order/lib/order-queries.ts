"use server";

import { prisma, prismaAccelerate } from "@/lib/prisma";

export async function getShopOrderHistory(shopId: string) {
  return await prisma.order.findMany({
    where: {
      shop_id: shopId,
      status: "COMPLETED",
    },
    select: {
      created_at: true,
      total_price: true,
      customer: {
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function getShopOrderDetail(id: string) {
  return await prisma.order.findFirst({
    where: {
      id,
    },
    include: {
      order_items: {
        select: {
          id: true,
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
          refund_disbursement_mode: true,
        },
      },
      testimony: true,
      complaint: true,
      refund: true,
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

export async function getCustomerOrderDetail(id: string) {
  return prisma.order.findFirst({
    where: {
      id,
    },
    include: {
      order_items: {
        select: {
          id: true,
          quantity: true,
          subtotal: true,
          price_at_add: true,
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
              slug: true,
              name: true,
            },
          },
          payments: {
            select: {
              method: true,
              qr_url: true,
              additional_price: true,
              note: true,
              account_number: true,
            },
          },
          owner_id: true,
          refund_disbursement_mode: true,
        },
      },
      complaint: true,
      testimony: true,
      refund: true,
      customer: {
        select: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
          table_number: true,
          floor: true,
        },
      },
    },
  });
}

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
      updated_at: true,
      shop: {
        select: {
          id: true,
          owner_id: true,
        },
      },
      post_order_type: true,
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
          id: true,
          quantity: true,
          price_at_add: true,
          subtotal: true,
          note: true,
          selected_options: {
            select: {
              value: true,
            },
          },
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

export async function getOrderAndPaymentMethod(order_id: string) {
  return await prisma.order.findUnique({
    where: {
      id: order_id,
    },
    select: {
      conversation_id: true,
      status: true,
      payment_method: true,
      payment_proof_url: true,
      total_price: true,
      shop: {
        select: {
          payments: {
            select: {
              method: true,
              qr_url: true,
              additional_price: true,
              note: true,
              account_number: true,
            },
          },
        },
      },
    },
  });
}

export async function getRecentOrdersByShop(shopId: string, limit: number = 5) {
  return await prisma.order.findMany({
    where: {
      shop_id: shopId,
    },
    orderBy: {
      created_at: "desc",
    },
    take: limit,
    include: {
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

export async function getOrderTrackingData({ shopId }: { shopId: string }) {
  return await prisma.order.findMany({
    where: {
      shop_id: shopId,
      status: {
        notIn: ["COMPLETED", "REJECTED"],
      },
    },
    orderBy: {
      updated_at: "desc",
    },
    select: {
      id: true,
      status: true,
      post_order_type: true,
      estimation: true,
      payment_method: true,
      payment_proof_url: true,
      customer: {
        select: {
          floor: true,
          table_number: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}
