"use server";

import { ShopSearchParamsInput } from "@/features/shop/types/shop-search-params";
import { Prisma } from "@/generated/prisma";
import { prismaAccelerate } from "@/lib/prisma";

export async function getCanteenBySlug(slug: string, search: ShopSearchParamsInput) {
  const { name, categories, minimumPrice, maximumPrice } = search;

  type WhereClause = Prisma.ShopWhereInput

  let whereClause: WhereClause = {}

  if (name) {
    whereClause['name'] = {
      contains: name,
    }
  }

  if (minimumPrice) {
    whereClause['minimum_price'] = {
      gte: minimumPrice,
    }
  }

  if (maximumPrice) {
    whereClause['maximum_price'] = {
      lte: maximumPrice,
    }
  }

  if (categories.length > 0) {
    whereClause['products'] = {
      some: {
        categories: {
          every: {
            category_id: {
              in: categories
            }
          }
        }
      }
    }
  }

  return await prismaAccelerate.canteen.findUnique({
    where: { slug },
    include: {
      shops: {
        where: whereClause,
        select: {
          id: true,
          image_url: true,
          name: true,
          minimum_price: true,
          maximum_price: true,
          average_rating: true,
          total_ratings: true,
          status: true,
          owner: {
            select: {
              user_id: true,
            },
          },
        },
      },
    },
  });
}
