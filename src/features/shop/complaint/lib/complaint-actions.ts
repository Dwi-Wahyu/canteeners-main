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
import { adminDb } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";
import { FieldValue } from "firebase-admin/firestore";

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

    const notificationRef = adminDb.collection("notifications");

    // Send notification to shop owner
    const notificationData = {
      recipientId: created.order.shop.owner_id,
      type: "COMPLAINT",
      subType: "SUBMITTED",
      title: `Komplain Baru dari Pelanggan`,
      body: `Pelanggan ${created.order.customer.user.name} mengajukan komplain`,
      isRead: false,
      intent: "WARNING",
      resourcePath: `/dashboard-kedai/order/${created.order_id}`,
      createdAt: FieldValue.serverTimestamp(),
    };

    await notificationRef.add(notificationData);

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

    const notificationRef = adminDb.collection("notifications");

    // Create notification based on status
    let notificationTitle = "";
    let notificationBody = "";
    let notificationIntent: "INFO" | "SUCCESS" | "WARNING" = "INFO";

    switch (payload.status) {
      case "UNDER_REVIEW":
        notificationTitle = "Komplain Sedang Ditinjau";
        notificationBody = "Pemilik kedai sedang meninjau komplain Anda";
        notificationIntent = "INFO";
        break;

      case "RESOLVED":
        notificationTitle = "Komplain Diselesaikan";
        notificationBody = "Komplain Anda telah diselesaikan oleh pihak kedai";
        notificationIntent = "SUCCESS";
        break;

      case "REJECTED":
        notificationTitle = "Komplain Ditolak";
        notificationBody =
          "Komplain Anda ditolak. Lihat tanggapan kedai untuk detail lebih lanjut";
        notificationIntent = "WARNING";
        break;
    }

    // Send notification to customer
    const notificationData = {
      recipientId: updated.order.customer.user_id,
      type: "COMPLAINT",
      subType: payload.status,
      title: notificationTitle,
      body: notificationBody,
      isRead: false,
      intent: notificationIntent,
      resourcePath: `/order/${updated.order_id}`,
      createdAt: FieldValue.serverTimestamp(),
    };

    await notificationRef.add(notificationData);

    return successResponse(undefined, "Sukses memperbarui komplain");
  } catch (error) {
    console.error("updateShopComplaint Error:", error);
    return errorResponse("Terjadi kesalahan saat memperbarui komplain");
  }
}
