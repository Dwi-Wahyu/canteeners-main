"use server";

import { prisma } from "@/lib/prisma";
import { ShopProductsSearchParamsInput } from "../types/shop-search-params";

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
  searchParams: ShopProductsSearchParamsInput,
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

export async function getShopDashboardStats(
  shopId: string,
  period: "today" | "week" | "month" | "all" = "today"
) {
  const now = new Date();
  let startDate: Date | undefined;
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  if (period === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "week") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "all") {
    startDate = undefined; // No lower bound
  }

  const dateFilter = startDate ? { gte: startDate, lt: endDate } : { lt: endDate };

  // Get period specific orders with items for net revenue calculation
  const periodOrders = await prisma.order.findMany({
    where: {
      shop_id: shopId,
      created_at: dateFilter,
      status: "COMPLETED",
    },
    include: {
      order_items: {
        include: {
          selected_options: true
        }
      }
    }
  });

  const totalRevenueInPeriod = periodOrders.reduce(
    (acc, order) => acc + order.total_price,
    0,
  );

  // Net revenue = sum of (price_at_add + options_price) * quantity
  const totalNetRevenueInPeriod = periodOrders.reduce((acc, order) => {
    const orderNet = order.order_items.reduce((itemAcc, item) => {
      const optionsPrice = item.selected_options.reduce((optAcc, opt) => optAcc + (opt.additional_price || 0), 0);
      return itemAcc + (item.price_at_add + optionsPrice) * item.quantity;
    }, 0);
    return acc + orderNet;
  }, 0);

  const totalOrdersInPeriod = periodOrders.length;

  const averageOrderValue =
    totalOrdersInPeriod > 0 ? totalNetRevenueInPeriod / totalOrdersInPeriod : 0;

  // Calculate average preparation time (in minutes)
  const completedOrdersWithPrepTime = periodOrders.filter(
    (o) => o.processed_at && o.status === "COMPLETED"
  );
  
  const totalPrepTime = completedOrdersWithPrepTime.reduce((acc, order) => {
    const prepDuration = (order.updated_at.getTime() - order.processed_at!.getTime()) / (1000 * 60);
    return acc + prepDuration;
  }, 0);

  const avgPrepTime = completedOrdersWithPrepTime.length > 0 
    ? Math.round(totalPrepTime / completedOrdersWithPrepTime.length) 
    : 0;

  // Get total complaints in period
  const totalComplaintsInPeriod = await prisma.shopComplaint.count({
    where: {
      order: {
        shop_id: shopId,
      },
      created_at: dateFilter,
    },
  });

  // Get pending orders count (always current)
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

  // Get total refunds in period (PROCESSED status)
  const totalRefundsInPeriod = await prisma.refund.count({
    where: {
      order: {
        shop_id: shopId,
      },
      requested_at: dateFilter,
      status: "PROCESSED",
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
      status: "COMPLETED"
    },
    include: {
      order_items: {
        include: {
          selected_options: true
        }
      }
    }
  });

  // Group by date
  const chartData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
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

    const dailyNetRevenue = ordersForDay.reduce((acc, order) => {
      return acc + order.order_items.reduce((itemAcc, item) => {
        const optionsPrice = item.selected_options.reduce((optAcc, opt) => optAcc + (opt.additional_price || 0), 0);
        return itemAcc + (item.price_at_add + optionsPrice) * item.quantity;
      }, 0);
    }, 0);

    chartData.push({
      date: displayDate,
      revenue: dailyNetRevenue,
      orders: ordersForDay.length,
    });
  }

  // Get total gross revenue & total net revenue (all time)
  const allCompletedOrders = await prisma.order.findMany({
    where: {
      shop_id: shopId,
      status: "COMPLETED",
    },
    include: {
      order_items: {
        include: {
          selected_options: true
        }
      }
    }
  });

  const totalGrossRevenue = allCompletedOrders.reduce(
    (acc, order) => acc + order.total_price,
    0,
  );

  const totalAllTimeNetRevenue = allCompletedOrders.reduce((acc, order) => {
    const orderNet = order.order_items.reduce((itemAcc, item) => {
      const optionsPrice = item.selected_options.reduce((optAcc, opt) => optAcc + (opt.additional_price || 0), 0);
      return itemAcc + (item.price_at_add + optionsPrice) * item.quantity;
    }, 0);
    return acc + orderNet;
  }, 0);

  return {
    totalRevenueInPeriod, // Gross in period
    totalNetRevenueInPeriod, // Net in period
    totalOrdersInPeriod,
    pendingOrdersCount,
    totalRefundsInPeriod,
    averageOrderValue,
    avgPrepTime,
    totalComplaintsInPeriod,
    chartData,
    totalGrossRevenue, // Total Gross
    totalAllTimeNetRevenue, // Total Net
  };
}

export async function getShopRanking(shopId: string) {
  const now = new Date();
  // Get start of this week (Monday)
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  // Get all completed orders this week across all shops
  const allCompletedOrders = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
      created_at: {
        gte: startOfWeek,
      },
    },
    select: {
      shop_id: true,
    },
  });

  // Group and count orders by shop
  const shopCounts = allCompletedOrders.reduce(
    (acc, order) => {
      acc[order.shop_id] = (acc[order.shop_id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Convert to array and sort
  const sortedShops = Object.entries(shopCounts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);

  // Find rank (1-based)
  const rank = sortedShops.findIndex((s) => s.id === shopId) + 1;
  const totalShops = sortedShops.length;

  return {
    rank: rank > 0 ? rank : null,
    totalShops,
    orderCount: shopCounts[shopId] || 0,
  };
}

export async function getShopStatus(id: string) {
  return prisma.shop.findFirst({
    where: {
      id,
    },
    select: {
      status: true,
      open_time: true,
      close_time: true,
      is_auto_accept: true,
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
