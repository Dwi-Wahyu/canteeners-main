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
    // Data dasar billing untuk mendapatkan rentang tanggal dan ID toko
    const billingMeta = await prisma.shopBilling.findUnique({
      where: { id: billingId },
      select: {
        start_date: true,
        end_date: true,
        shop_id: true,
      },
    });

    if (!billingMeta) return null;

    // Ambil billing lengkap dengan orders yang sudah difilter berdasarkan rentang tanggal tersebut
    const billing = await prisma.shopBilling.findUnique({
      where: { id: billingId },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                user: {
                  select: { name: true },
                },
              },
            },
            // Filter orders berdasarkan tanggal
            orders: {
              where: {
                created_at: {
                  gte: billingMeta.start_date,
                  lte: billingMeta.end_date,
                },
                // Hanya ambil order yang sudah selesai/dibayar
                status: "COMPLETED",
              },
              orderBy: {
                created_at: "desc",
              },
              include: {
                order_items: true,
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
