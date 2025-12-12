"use server";

import { prisma } from "@/lib/prisma";

export async function getShopProducts(shop_id: string, name: string) {
  return await prisma.product.findMany({
    where: {
      shop_id,
      name: {
        contains: name,
      },
    },
    include: {
      options: {
        select: {
          option: true,
        },
      },
    },
  });
}

export async function getProductIncludeCategory(id: string) {
  return await prisma.product.findFirst({
    where: {
      id,
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
}

export async function getProductById(id: string) {
  return await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          order_items: {
            where: {
              order: {
                status: "COMPLETED",
              },
            },
          },
        },
      },
      options: {
        orderBy: {
          is_required: "desc",
        },
        include: {
          values: true,
        },
      },
    },
  });
}

export async function getProductOptionById(id: string) {
  return await prisma.productOption.findUnique({
    where: {
      id,
    },
  });
}
