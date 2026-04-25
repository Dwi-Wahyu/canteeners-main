"use server";

import { ShopSearchParamsInput } from "@/features/shop/types/shop-search-params";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function getCanteens() {
  return await prisma.canteen.findMany({
    include: {
      shops: {
        select: {
          name: true,
          average_rating: true,
          description: true,
        },
      },
      maps: {
        select: {
          floor: true,
        },
      },
    },
  });
}

export async function getCanteenBySlug(
  slug: string,
  search: ShopSearchParamsInput,
) {
  const { name, categories, minimumPrice, maximumPrice } = search;

  const productWhere: Prisma.ProductWhereInput = {
    AND: [
      minimumPrice ? { price: { gte: minimumPrice } } : {},
      maximumPrice && maximumPrice > 0 ? { price: { lte: maximumPrice } } : {},
      categories.length > 0
        ? {
            categories: {
              some: {
                category_id: {
                  in: categories,
                },
              },
            },
          }
        : {},
      name
        ? {
            OR: [
              { name: { contains: name, mode: "insensitive" } },
              { shop: { name: { contains: name, mode: "insensitive" } } },
            ],
          }
        : {},
    ],
  };

  const shopWhere: Prisma.ShopWhereInput = {
    AND: [
      name
        ? {
            OR: [
              { name: { contains: name, mode: "insensitive" } },
              {
                products: {
                  some: { name: { contains: name, mode: "insensitive" } },
                },
              },
            ],
          }
        : {},
      (minimumPrice || (maximumPrice && maximumPrice > 0))
        ? {
            products: {
              some: {
                price: {
                  gte: minimumPrice || undefined,
                  lte: (maximumPrice && maximumPrice > 0) ? maximumPrice : undefined,
                },
              },
            },
          }
        : {},
      categories.length > 0
        ? {
            OR: [
              {
                products: {
                  some: {
                    categories: {
                      some: {
                        category_id: { in: categories },
                      },
                    },
                  },
                },
              },
              {
                specializations: {
                  some: {
                    category_id: { in: categories },
                  },
                },
              },
            ],
          }
        : {},
    ],
  };

  return await prisma.canteen.findUnique({
    where: { slug },
    include: {
      shops: {
        where: shopWhere,
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
          specializations: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          products: {
            where: productWhere,
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
                orderBy: { is_required: "desc" },
                include: {
                  values: true,
                },
              },
            },
          },
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
  return await prisma.canteen.findUnique({
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
