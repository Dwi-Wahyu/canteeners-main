"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getShopProducts(
  shop_id: string,
  params: {
    name?: string | null;
    categoryId?: number | null;
    isAvailable?: boolean | null;
    sortBy?: string | null;
  },
) {
  const { name, categoryId, isAvailable, sortBy } = params;

  type WhereClause = Prisma.ProductWhereInput;
  let whereClause: WhereClause = {
    shop_id,
  };

  if (name) {
    whereClause["name"] = {
      contains: name,
      mode: "insensitive",
    };
  }

  if (categoryId) {
    whereClause["categories"] = {
      some: {
        category_id: categoryId,
      },
    };
  }

  if (isAvailable !== undefined && isAvailable !== null) {
    whereClause["is_available"] = isAvailable;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
    created_at: "desc",
  };

  if (sortBy === "best_selling") {
    orderBy = {
      order_items: {
        _count: "desc",
      },
    };
  } else if (sortBy === "price_asc") {
    orderBy = {
      price: "asc",
    };
  } else if (sortBy === "price_desc") {
    orderBy = {
      price: "desc",
    };
  }

  return await prisma.product.findMany({
    where: whereClause,
    orderBy,
    include: {
      options: {
        select: {
          option: true,
        },
      },
      _count: {
        select: {
          order_items: true,
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
    where: { id },
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
        include: { values: true },
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

export async function getBestSellingProducts(shopId: string, limit = 5) {
  // GroupBy untuk mendapatkan ranking produk terlaris berdasarkan total quantity
  const bestSellers = await prisma.orderItem.groupBy({
    by: ["product_id"],
    where: {
      order: {
        shop_id: shopId,
        status: "COMPLETED",
      },
      product: {
        shop_id: shopId, // Pastikan produk memang milik shop ini (extra safety)
      },
    },
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: limit,
  });

  // Jika tidak ada penjualan, kembalikan array kosong
  if (bestSellers.length === 0) {
    return [];
  }

  // Ekstrak product_id dan total_sold (handle null → default 0)
  const productSalesMap = new Map<string, { total_sold: number }>();

  bestSellers.forEach((item) => {
    productSalesMap.set(item.product_id, {
      total_sold: item._sum.quantity ?? 0,
    });
  });

  const productIds = Array.from(productSalesMap.keys());

  // Satu query saja untuk ambil semua detail produk sekaligus
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      shop_id: shopId, // Pastikan hanya produk dari shop ini
    },
    select: {
      id: true,
      name: true,
      image_url: true,
      price: true,
    },
  });

  // Gabungkan data penjualan dengan detail produk, sambil mempertahankan urutan ranking
  const result = productIds
    .map((productId) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return null; // Safety (seharusnya tidak terjadi)

      const sales = productSalesMap.get(productId)!;

      return {
        id: product.id,
        name: product.name,
        image_url: product.image_url,
        price: product.price,
        total_sold: sales.total_sold,
      };
    })
    .filter(Boolean); // Hilangkan null jika ada

  return result;
}
