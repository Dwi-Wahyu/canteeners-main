"use server";

import { ShopSearchParamsInput } from "@/features/shop/types/shop-search-params";
import { Prisma } from "@/generated/prisma";
import { prisma, prismaAccelerate } from "@/lib/prisma";

export async function getCanteenBySlug(
  slug: string,
  search: ShopSearchParamsInput
) {
  const { name, categories, minimumPrice, maximumPrice } = search;

  type WhereClause = Prisma.ShopWhereInput;

  let whereClause: WhereClause = {};

  if (name) {
    whereClause["name"] = {
      contains: name,
    };
  }

  // Price range overlap logic:
  // - Shop's minimum_price should be <= user's maximumPrice (shop has items at/below max)
  // - Shop's maximum_price should be >= user's minimumPrice (shop has items at/above min)
  if (minimumPrice) {
    whereClause["maximum_price"] = {
      gte: minimumPrice, // Shop's highest price is at least the user's minimum
    };
  }

  if (maximumPrice) {
    whereClause["minimum_price"] = {
      lte: maximumPrice, // Shop's lowest price is at most the user's maximum
    };
  }

  if (categories.length > 0) {
    whereClause["products"] = {
      some: {
        categories: {
          every: {
            category_id: {
              in: categories,
            },
          },
        },
      },
    };
  }

  return await prisma.canteen.findUnique({
    where: { slug },
    include: {
      shops: {
        where: whereClause,
        select: {
          _count: {
            select: {
              orders: {
                where: {
                  status: "COMPLETED",
                  testimony: {
                    isNot: null,
                  },
                },
              },
            },
          },
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

export async function getCanteenIncludeMaps(slug: string) {
  return await prismaAccelerate.canteen.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      maps: {
        select: {
          floor: true,
          image_url: true,
          table_count: true,
        },
      },
    },
  });
}
