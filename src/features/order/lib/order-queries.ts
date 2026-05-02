"use server";

import { prisma } from "@/lib/prisma";

export async function getShopOrderHistory(
  shopId: string,
  filters?: {
    status?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  },
) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where = {
    shop_id: shopId,
    status: filters?.status
      ? (filters.status as any)
      : { in: ["COMPLETED", "REJECTED", "CANCELLED"] },
    AND: [
      filters?.search
        ? {
            customer: {
              user: {
                name: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
            },
          }
        : {},
      filters?.startDate || filters?.endDate
        ? {
            created_at: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }
        : {},
    ],
  };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where: where as any,
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
      select: {
        id: true,
        created_at: true,
        total_price: true,
        status: true,
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
    }),
    prisma.order.count({
      where: where as any,
    }),
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
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
              maps: {
                select: {
                  floor: true,
                  image_url: true,
                },
              },
            },
          },
          name: true,
          owner_id: true,
          refund_disbursement_mode: true,
        },
      },
      testimony: true,
      complaint: true,
      refund: {
        include: {
          history: {
            select: {
              id: true,
              status: true,
              note: true,
              actor_role: true,
              actor_name: true,
              created_at: true,
            },
            orderBy: {
              created_at: "desc",
            },
          },
        },
      },
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
      refund: {
        include: {
          history: {
            select: {
              id: true,
              status: true,
              note: true,
              actor_role: true,
              actor_name: true,
              created_at: true,
            },
            orderBy: {
              created_at: "desc",
            },
          },
        },
      },
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
              slug: true,
              name: true,
              maps: {
                select: {
                  floor: true,
                  image_url: true,
                },
              },
            },
          },
          name: true,
          owner_id: true,
          refund_disbursement_mode: true,
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
      testimony: true,
      complaint: true,
      refund: {
        include: {
          history: {
            select: {
              id: true,
              status: true,
              note: true,
              actor_role: true,
              actor_name: true,
              created_at: true,
            },
            orderBy: {
              created_at: "desc",
            },
          },
        },
      },
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
      confirmed_at: true,
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
        notIn: ["COMPLETED", "REJECTED", "CANCELLED"],
      },
    },
    orderBy: {
      updated_at: "asc",
    },
    select: {
      id: true,
      status: true,
      post_order_type: true,
      estimation: true,
      processed_at: true,
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
      order_items: {
        select: {
          quantity: true,
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

export async function getCustomerOrderHistory(
  customerId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }
) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where = {
    customer_id: customerId,
    AND: [
      filters?.startDate || filters?.endDate
        ? {
            created_at: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }
        : {},
    ],
  };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where: where as any,
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
      include: {
        shop: {
          select: {
            name: true,
            image_url: true,
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
    }),
    prisma.order.count({
      where: where as any,
    }),
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}
