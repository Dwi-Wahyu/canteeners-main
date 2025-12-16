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
