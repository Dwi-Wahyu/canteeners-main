"use server";

import {
  ShopComplaintInput,
  UpdateComplaintInput,
} from "@/features/shop/complaint/types/complaint-schema";
import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";
import { createAndPublishNotification } from "@/lib/realtime/publish-internal";

export async function createShopComplaint(payload: ShopComplaintInput) {
  try {
    const created = await prisma.shopComplaint.create({
      data: {
        cause: payload.cause,
        proof_url: payload.proof_url,
        order_id: payload.order_id,
      },
      include: {
        order: {
          select: {
            customer: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            shop: {
              select: {
                owner_id: true,
              },
            },
          },
        },
      },
    });

    await createAndPublishNotification({
      recipient_id: created.order.shop.owner_id,
      type: "COMPLAINT",
      subtype: "SUBMITTED",
      title: `Komplain Baru dari Pelanggan`,
      body: `Pelanggan ${created.order.customer.user.name} mengajukan komplain`,
      data: { resourcePath: `/dashboard-kedai/order/${created.order_id}` },
    });

    return successResponse(created, "Sukses menambahkan komplain");
  } catch (error) {
    return errorResponse("Terjadi kesalahan saat menambahkan komplain");
  }
}

export async function updateShopComplaint(
  payload: UpdateComplaintInput
): Promise<ServerActionReturn<void>> {
  try {
    const updated = await prisma.shopComplaint.update({
      where: {
        id: payload.complaint_id,
      },
      data: {
        feedback: payload.feedback,
        status: payload.status,
      },
      include: {
        order: {
          select: {
            id: true,
            customer: {
              select: {
                user_id: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let notificationTitle = "";
    let notificationBody = "";

    switch (payload.status) {
      case "UNDER_REVIEW":
        notificationTitle = "Komplain Sedang Ditinjau";
        notificationBody = "Pemilik kedai sedang meninjau komplain Anda";
        break;

      case "RESOLVED":
        notificationTitle = "Komplain Diselesaikan";
        notificationBody = "Komplain Anda telah diselesaikan oleh pihak kedai";
        break;

      case "REJECTED":
        notificationTitle = "Komplain Ditolak";
        notificationBody =
          "Komplain Anda ditolak. Lihat tanggapan kedai untuk detail lebih lanjut";
        break;
    }

    await createAndPublishNotification({
      recipient_id: updated.order.customer.user_id,
      type: "COMPLAINT",
      subtype: payload.status,
      title: notificationTitle,
      body: notificationBody,
      data: { resourcePath: `/order/${updated.order_id}` },
    });

    return successResponse(undefined, "Sukses memperbarui komplain");
  } catch (error) {
    console.error("updateShopComplaint Error:", error);
    return errorResponse("Terjadi kesalahan saat memperbarui komplain");
  }
}
