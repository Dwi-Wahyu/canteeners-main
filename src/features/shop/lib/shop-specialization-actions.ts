"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";

export async function updateShopSpecializations(
  shopId: string,
  categoryIds: number[]
): Promise<ServerActionReturn<void>> {
  try {
    // We use a transaction to ensure all-or-nothing update
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing specializations
      await tx.shopCategory.deleteMany({
        where: {
          shop_id: shopId,
        },
      });

      // 2. Add new specializations
      if (categoryIds.length > 0) {
        await tx.shopCategory.createMany({
          data: categoryIds.map((id) => ({
            shop_id: shopId,
            category_id: id,
          })),
        });
      }
    });

    revalidatePath("/dashboard-kedai/pengaturan");
    revalidatePath("/dashboard-kedai/pengaturan/spesialisasi");
    // Also revalidate the main canteen/shop pages if needed
    revalidatePath("/kantin/[slug]", "page");

    return successResponse(undefined, "Berhasil memperbarui spesialisasi kedai");
  } catch (error) {
    console.error("Error updating shop specializations:", error);
    return errorResponse("Terjadi kesalahan saat memperbarui spesialisasi kedai");
  }
}
