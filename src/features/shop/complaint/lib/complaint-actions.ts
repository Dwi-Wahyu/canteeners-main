"use server";

import { ShopComplaintInput } from "@/features/shop/complaint/types/complaint-schema";
import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";

export async function createShopComplaint(payload: ShopComplaintInput) {
  try {
    const created = await prisma.shopComplaint.create({
      data: {
        cause: payload.cause,
        proof_url: payload.proof_url,
        order_id: payload.order_id,
      },
    });

    return successResponse(created, "Sukses menambahkan komplain");
  } catch (error) {
    return errorResponse("Terjadi kesalahan saat menambahkan komplain");
  }
}
