import { RefundStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

export async function getRefundByOrderId(orderId: string) {
  try {
    const refund = await prisma.refund.findUnique({
      where: {
        order_id: orderId,
      },
      include: {
        affected_items: {
          select: {
            order_item_id: true,
          },
        },
        order: {
          include: {
            order_items: {
              include: {
                product: {
                  select: {
                    name: true,
                    image_url: true,
                  },
                },
              },
            },
            customer: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            shop: {
              select: {
                id: true,
                name: true,
                owner_id: true,
                refund_disbursement_mode: true,
              },
            },
          },
        },
      },
    });

    return refund;
  } catch (error) {
    console.error("getRefundByOrderId Error:", error);
    return null;
  }
}

export async function getShopRefunds(
  shopId: string,
  status: RefundStatus | null
) {
  try {
    const refunds = await prisma.refund.findMany({
      where: {
        order: {
          shop_id: shopId,
        },
        ...(status && { status }),
      },
      include: {
        affected_items: {
          select: {
            order_item_id: true,
          },
        },
        order: {
          select: {
            id: true,
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
            order_items: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        requested_at: "desc",
      },
    });

    return refunds;
  } catch (error) {
    console.error("getShopRefunds Error:", error);
    return [];
  }
}

export async function getCustomerRefunds(
  customerId: string,
  status?: RefundStatus
) {
  try {
    const refunds = await prisma.refund.findMany({
      where: {
        order: {
          customer_id: customerId,
        },
        ...(status && { status }),
      },
      include: {
        affected_items: {
          select: {
            order_item_id: true,
          },
        },
        order: {
          select: {
            id: true,
            created_at: true,
            total_price: true,
            shop: {
              select: {
                name: true,
                image_url: true,
              },
            },
            order_items: {
              include: {
                product: {
                  select: {
                    name: true,
                    image_url: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        requested_at: "desc",
      },
    });

    return refunds;
  } catch (error) {
    console.error("getCustomerRefunds Error:", error);
    return [];
  }
}
