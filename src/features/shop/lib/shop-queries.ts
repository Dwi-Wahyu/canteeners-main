"use server";

import { prisma } from "@/lib/prisma";
import {
  ShopProductsSearchParamsInput,
  ShopSearchParamsInput,
} from "../types/shop-search-params";

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

  const shop = await prisma.shop.findUnique({
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

  return shop;
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
