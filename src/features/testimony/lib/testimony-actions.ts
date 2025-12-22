"use server";

import { ShopTestimony } from "@/generated/prisma";
import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";

export async function createShopTestimony({
  message,
  rating,
  order_id,
}: {
  message: string;
  rating: number;
  order_id: string;
}): Promise<ServerActionReturn<ShopTestimony>> {
  try {
    // Gunakan transaksi untuk memastikan pembuatan ulasan DAN pembaruan rating
    // terjadi bersamaan atau tidak sama sekali (atomik).
    const createdTestimony = await prisma.$transaction(async (tx) => {
      // Buat ulasan baru dan ambil shop_id dari order terkait
      const created = await tx.shopTestimony.create({
        data: {
          message,
          rating,
          order_id,
        },
        include: {
          order: {
            select: {
              shop_id: true,
            },
          },
        },
      });

      const shop_id = created.order.shop_id;

      // Hitung ulang rata-rata dan total rating untuk toko tersebut
      const shopAggregates = await tx.shopTestimony.aggregate({
        where: {
          // Filter ulasan berdasarkan shop_id dari order
          order: {
            shop_id: shop_id,
          },
        },
        _avg: {
          rating: true, // Hitung rata-rata
        },
        _count: {
          rating: true, // Hitung jumlah total
        },
      });

      const newAverageRating = shopAggregates._avg.rating ?? 0;
      const newTotalRatings = shopAggregates._count.rating ?? 0;

      // Perbarui data di model Shop
      await tx.shop.update({
        where: {
          id: shop_id,
        },
        data: {
          average_rating: newAverageRating,
          total_ratings: newTotalRatings,
        },
      });

      // Kembalikan ulasan yang baru dibuat
      return created;
    });

    return successResponse(createdTestimony, "Sukses menambahkan ulasan");
  } catch (error) {
    console.error(error); // Tambahkan log untuk debugging
    return errorResponse("Terjadi kesalahan saat menambahkan ulasan");
  }
}
