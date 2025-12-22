"use server";

import { ShopBillingStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function getShopBillings(
  shopId: string,
  status?: ShopBillingStatus
) {
  try {
    const billings = await prisma.shopBilling.findMany({
      where: {
        shop_id: shopId,
        ...(status && { status }),
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        end_date: "desc",
      },
    });

    return billings;
  } catch (error) {
    console.error("getShopBillings Error:", error);
    return [];
  }
}

export async function getBillingById(billingId: string) {
  try {
    const billing = await prisma.shopBilling.findUnique({
      where: {
        id: billingId,
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return billing;
  } catch (error) {
    console.error("getBillingById Error:", error);
    return null;
  }
}
