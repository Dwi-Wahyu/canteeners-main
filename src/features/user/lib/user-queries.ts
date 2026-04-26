"use server";

import { prisma } from "@/lib/prisma";

export async function getUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: { username },
  });
}

export async function getCustomerById({ customerId }: { customerId: string }) {
  return await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
          id: true,
        },
      },
      cart: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function getCustomerProfile(id: string) {
  return await prisma.customer.findFirst({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
          name: true,
          avatar: true,
        },
      },
      discounts: {
        where: {
          is_used: false,
          discount: {
            status: "ACTIVE",
          },
        },
        include: {
          discount: true,
        },
      },
    },
  });
}

export async function getUserShortDetail(id: string) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      name: true,
      avatar: true,
    },
  });
}

export async function getCustomerSelectedTable(customer_id: string) {
  return await prisma.customer.findFirst({
    where: {
      id: customer_id,
      canteen_id: {
        not: null,
      },
      floor: {
        not: null,
      },
      table_number: {
        not: null,
      },
    },
    select: {
      canteen_id: true,
      floor: true,
      table_number: true,
    },
  });
}

export async function getCustomerReferralStatus(userId: string) {
  const customer = await prisma.customer.findUnique({
    where: { user_id: userId },
    select: {
      id: true,
      referral_code: true,
      referral_usage_count: true,
      discounts: {
        where: {
          is_used: false,
          discount: {
            status: "ACTIVE",
          },
        },
        include: {
          discount: true,
        },
      },
      _count: {
        select: {
          orders: {
            where: {
              status: "COMPLETED",
            },
          },
        },
      },
    },
  });

  if (!customer) return null;

  return {
    referral_code: customer.referral_code,
    completed_orders_count: customer._count.orders,
    is_eligible: customer._count.orders >= 2,
    referral_usage_count: customer.referral_usage_count,
    vouchers: customer.discounts.map((cd) => ({
      id: cd.id,
      name: cd.discount.name,
      value: cd.discount.value,
      type: cd.discount.type,
      description: cd.discount.description,
      status: cd.discount.status,
    })),
  };
}
