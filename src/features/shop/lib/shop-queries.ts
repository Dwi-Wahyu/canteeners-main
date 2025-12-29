"use server";

import { prisma, prismaAccelerate } from "@/lib/prisma";
import {
  ShopProductsSearchParamsInput,
  ShopSearchParamsInput,
} from "../types/shop-search-params";
import { cacheLife, cacheTag } from "next/cache";

export async function getShopById(id: string) {
  return await prisma.shop.findUnique({
    where: {
      id,
    },
    include: {
      owner: true,
    },
  });
}

export async function getShopAndProducts(
  id: string,
  searchParams: ShopProductsSearchParamsInput
) {
  const { page, perPage, productName } = searchParams;

  return await prisma.shop.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      canteen: {
        select: {
          slug: true,
        },
      },
      open_time: true,
      close_time: true,
      owner: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      description: true,
      image_url: true,
      average_rating: true,
      total_ratings: true,
      products: {
        where: {
          name: { contains: productName, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          description: true,
          image_url: true,
          price: true,
          is_available: true,
        },
      },
    },
  });
}

export async function getShopTestimonies(shop_id: string) {
  return await prisma.shopTestimony.findMany({
    where: {
      order: {
        shop_id,
      },
    },
    include: {
      order: {
        select: {
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
  });
}

export async function getShopDashboardStats(shopId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  // Get total revenue today
  const ordersToday = await prisma.order.findMany({
    where: {
      shop_id: shopId,
      created_at: {
        gte: startOfDay,
        lt: endOfDay,
      },
      status: "COMPLETED",
    },
    select: {
      total_price: true,
    },
  });

  const totalRevenueToday = ordersToday.reduce(
    (acc, order) => acc + order.total_price,
    0
  );

  // Get total orders today
  const totalOrdersToday = ordersToday.length;

  // Get pending orders count
  const pendingOrdersCount = await prisma.order.count({
    where: {
      shop_id: shopId,
      status: {
        in: [
          "WAITING_PAYMENT",
          "WAITING_SHOP_CONFIRMATION",
          "PENDING_CONFIRMATION",
        ],
      },
    },
  });

  // Get last 7 days stats for chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const last7DaysOrders = await prisma.order.findMany({
    where: {
      shop_id: shopId,
      created_at: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      created_at: true,
      total_price: true,
    },
  });

  // Group by date
  const chartData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
    const displayDate = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });

    const ordersForDay = last7DaysOrders.filter((o) => {
      const orderDate = new Date(o.created_at);
      return (
        orderDate.getFullYear() === d.getFullYear() &&
        orderDate.getMonth() === d.getMonth() &&
        orderDate.getDate() === d.getDate()
      );
    });

    chartData.push({
      date: displayDate,
      fullDate: dateStr,
      revenue: ordersForDay.reduce((acc, o) => acc + o.total_price, 0),
      orders: ordersForDay.length,
    });
  }

  const averageOrderValue =
    totalOrdersToday > 0 ? totalRevenueToday / totalOrdersToday : 0;

  return {
    totalRevenueToday,
    totalOrdersToday,
    pendingOrdersCount,
    averageOrderValue,
    chartData,
  };
}

export async function getShopStatus(id: string) {
  return prismaAccelerate.shop.findFirst({
    where: {
      id,
    },
    select: {
      status: true,
      open_time: true,
      close_time: true,
    },
  });
}

export async function getShopRatings(id: string) {
  return await prisma.shop.findUnique({
    where: { id },
    select: {
      id: true,
      average_rating: true,
      total_ratings: true,
    },
  });
}

export async function getShopByOwnerId(ownerId: string) {
  return await prisma.shop.findFirst({
    where: {
      owner_id: ownerId,
    },
    select: {
      id: true,
      name: true,
      image_url: true,
    },
  });
}
