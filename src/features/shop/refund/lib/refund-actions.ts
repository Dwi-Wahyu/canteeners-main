"use server";

import {
  RefundRequestInput,
  UpdateRefundStatusInput,
  ProcessRefundInput,
  CancelRefundInput,
  EscalateRefundInput,
} from "@/features/shop/refund/types/refund-schema";
import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { adminDb } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";
import { FieldValue } from "firebase-admin/firestore";

export async function createRefundRequest(
  payload: RefundRequestInput
): Promise<ServerActionReturn<void>> {
  try {
    // Fetch order with necessary relations
    const order = await prisma.order.findUnique({
      where: {
        id: payload.order_id,
      },
      include: {
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
        shop: {
          select: {
            owner_id: true,
            name: true,
          },
        },
        order_items: {
          select: {
            id: true,
            subtotal: true,
          },
        },
        refund: true,
      },
    });

    if (!order) {
      return errorResponse("Pesanan tidak ditemukan");
    }

    // Validate order status
    if (order.status !== "COMPLETED") {
      return errorResponse(
        "Refund hanya dapat diminta untuk pesanan yang sudah selesai"
      );
    }

    // Check if refund already exists
    if (order.refund) {
      return errorResponse("Refund sudah pernah diajukan untuk pesanan ini");
    }

    // Calculate refund amount based on reason
    let refundAmount: number;
    const isItemLevel = [
      "DAMAGED_FOOD",
      "MISSING_ITEM",
      "WRONG_ORDER",
    ].includes(payload.reason);

    if (isItemLevel) {
      // Calculate from affected items
      if (
        !payload.affected_item_ids ||
        payload.affected_item_ids.length === 0
      ) {
        return errorResponse("Item yang bermasalah harus dipilih");
      }

      const affectedItems = order.order_items.filter((item) =>
        payload.affected_item_ids!.includes(item.id)
      );

      if (affectedItems.length !== payload.affected_item_ids.length) {
        return errorResponse("Beberapa item tidak valid");
      }

      refundAmount = affectedItems.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
    } else {
      // Use provided amount
      if (!payload.amount) {
        return errorResponse("Jumlah refund harus diisi");
      }

      if (payload.amount > order.total_price) {
        return errorResponse(
          "Jumlah refund tidak boleh melebihi total pesanan"
        );
      }

      refundAmount = payload.amount;
    }

    // Create refund
    const refund = await prisma.refund.create({
      data: {
        order_id: payload.order_id,
        amount: refundAmount,
        reason: payload.reason,
        description: payload.description,
        complaint_proof_url: payload.complaint_proof_url,
        disbursement_mode: payload.disbursement_mode,
        status: "PENDING",
      },
    });

    // Create affected item records if applicable
    if (
      isItemLevel &&
      payload.affected_item_ids &&
      payload.affected_item_ids.length > 0
    ) {
      await prisma.refundItem.createMany({
        data: payload.affected_item_ids.map((itemId) => ({
          refund_id: refund.id,
          order_item_id: itemId,
        })),
      });
    }

    // Send notification to shop owner
    const notificationRef = adminDb.collection("notifications");
    const notificationData = {
      recipientId: order.shop.owner_id,
      type: "REFUND",
      subType: "REQUESTED",
      title: "Permintaan Refund Baru",
      body: `Customer mengajukan refund sebesar Rp ${refundAmount.toLocaleString(
        "id-ID"
      )} untuk pesanan #${order.id.substring(0, 8)}`,
      isRead: false,
      intent: "WARNING",
      resourcePath: `/dashboard-kedai/order/${order.id}`,
      createdAt: FieldValue.serverTimestamp(),
      metadata: {
        refundId: refund.id,
        amount: refundAmount,
        reason: payload.reason,
      },
    };

    await notificationRef.add(notificationData);

    return successResponse(undefined, "Permintaan refund berhasil diajukan");
  } catch (error) {
    console.error("createRefundRequest Error:", error);
    return errorResponse("Terjadi kesalahan saat mengajukan refund");
  }
}

export async function updateRefundStatus(
  payload: UpdateRefundStatusInput
): Promise<ServerActionReturn<void>> {
  try {
    const refund = await prisma.refund.findUnique({
      where: {
        id: payload.refund_id,
      },
      include: {
        order: {
          select: {
            id: true,
            customer: {
              select: {
                user_id: true,
              },
            },
          },
        },
      },
    });

    if (!refund) {
      return errorResponse("Refund tidak ditemukan");
    }

    if (refund.status !== "PENDING") {
      return errorResponse(
        "Hanya refund dengan status PENDING yang dapat diproses"
      );
    }

    // Update refund status
    const updated = await prisma.refund.update({
      where: {
        id: payload.refund_id,
      },
      data: {
        status: payload.status,
        rejected_reason:
          payload.status === "REJECTED" ? payload.rejected_reason : null,
        processed_at: payload.status === "APPROVED" ? new Date() : null,
      },
    });

    // Send notification to customer
    const notificationRef = adminDb.collection("notifications");

    let notificationTitle: string;
    let notificationBody: string;
    let notificationIntent: "SUCCESS" | "WARNING";

    if (payload.status === "APPROVED") {
      notificationTitle = "Refund Disetujui";
      notificationBody = `Permintaan refund Anda sebesar Rp ${refund.amount.toLocaleString(
        "id-ID"
      )} telah disetujui`;
      notificationIntent = "SUCCESS";
    } else {
      notificationTitle = "Refund Ditolak";
      notificationBody =
        "Permintaan refund Anda ditolak. Lihat alasan untuk detail lebih lanjut";
      notificationIntent = "WARNING";
    }

    const notificationData = {
      recipientId: refund.order.customer.user_id,
      type: "REFUND",
      subType: payload.status === "APPROVED" ? "APPROVED" : "REJECTED",
      title: notificationTitle,
      body: notificationBody,
      isRead: false,
      intent: notificationIntent,
      resourcePath: `/order/${refund.order_id}`,
      createdAt: FieldValue.serverTimestamp(),
      metadata:
        payload.status === "REJECTED"
          ? { rejectedReason: payload.rejected_reason }
          : { amount: refund.amount },
    };

    await notificationRef.add(notificationData);

    return successResponse(
      undefined,
      payload.status === "APPROVED"
        ? "Refund berhasil disetujui"
        : "Refund ditolak"
    );
  } catch (error) {
    console.error("updateRefundStatus Error:", error);
    return errorResponse("Terjadi kesalahan saat memproses refund");
  }
}

export async function processRefund(
  payload: ProcessRefundInput
): Promise<ServerActionReturn<void>> {
  try {
    const refund = await prisma.refund.findUnique({
      where: {
        id: payload.refund_id,
      },
      include: {
        order: {
          select: {
            id: true,
            customer: {
              select: {
                user_id: true,
              },
            },
          },
        },
      },
    });

    if (!refund) {
      return errorResponse("Refund tidak ditemukan");
    }

    if (refund.status !== "APPROVED") {
      return errorResponse(
        "Hanya refund yang sudah disetujui yang dapat diproses"
      );
    }

    // Update to PROCESSED status
    await prisma.refund.update({
      where: {
        id: payload.refund_id,
      },
      data: {
        status: "PROCESSED",
        disbursement_proof_url: payload.disbursement_proof_url,
      },
    });

    // Send notification to customer
    const notificationRef = adminDb.collection("notifications");
    const notificationData = {
      recipientId: refund.order.customer.user_id,
      type: "REFUND",
      subType: "DISBURSED",
      title: "Dana Refund Telah Dikirim",
      body: `Dana refund sebesar Rp${refund.amount.toLocaleString(
        "id-ID"
      )} telah dikirim melalui ${
        refund.disbursement_mode === "CASH" ? "tunai" : "transfer"
      }`,
      isRead: false,
      intent: "SUCCESS",
      resourcePath: `/order/${refund.order_id}`,
      createdAt: FieldValue.serverTimestamp(),
      metadata: {
        amount: refund.amount,
        disbursementMode: refund.disbursement_mode,
      },
    };

    await notificationRef.add(notificationData);

    return successResponse(undefined, "Refund berhasil diproses");
  } catch (error) {
    console.error("processRefund Error:", error);
    return errorResponse("Terjadi kesalahan saat memproses refund");
  }
}

export async function cancelRefund(
  payload: CancelRefundInput
): Promise<ServerActionReturn<void>> {
  try {
    const refund = await prisma.refund.findUnique({
      where: {
        id: payload.refund_id,
      },
      include: {
        order: {
          select: {
            id: true,
            shop: {
              select: {
                owner_id: true,
              },
            },
          },
        },
      },
    });

    if (!refund) {
      return errorResponse("Refund tidak ditemukan");
    }

    if (refund.status !== "PENDING") {
      return errorResponse(
        "Hanya refund dengan status PENDING yang dapat dibatalkan"
      );
    }

    // Update to CANCELLED status
    await prisma.refund.update({
      where: {
        id: payload.refund_id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    // Send notification to shop owner
    const notificationRef = adminDb.collection("notifications");
    const notificationData = {
      recipientId: refund.order.shop.owner_id,
      type: "REFUND",
      subType: "CANCELLED",
      title: "Refund Dibatalkan",
      body: "Customer membatalkan permintaan refund untuk pesanan ini",
      isRead: false,
      intent: "INFO",
      resourcePath: `/dashboard-kedai/order/${refund.order_id}`,
      createdAt: FieldValue.serverTimestamp(),
    };

    await notificationRef.add(notificationData);

    return successResponse(undefined, "Refund berhasil dibatalkan");
  } catch (error) {
    console.error("cancelRefund Error:", error);
    return errorResponse("Terjadi kesalahan saat membatalkan refund");
  }
}

export async function escalateRefund(
  payload: EscalateRefundInput
): Promise<ServerActionReturn<void>> {
  try {
    const refund = await prisma.refund.findUnique({
      where: {
        id: payload.refund_id,
      },
    });

    if (!refund) {
      return errorResponse("Refund tidak ditemukan");
    }

    if (["ESCALATED", "CANCELLED", "PROCESSED"].includes(refund.status)) {
      return errorResponse("Refund dengan status ini tidak dapat dieskalasi");
    }

    // Update to ESCALATED status
    await prisma.refund.update({
      where: {
        id: payload.refund_id,
      },
      data: {
        status: "ESCALATED",
        escalated_reason: payload.escalated_reason,
      },
    });

    // Note: No notification sent - admin system handles separately

    return successResponse(undefined, "Refund berhasil dieskalasi ke admin");
  } catch (error) {
    console.error("escalateRefund Error:", error);
    return errorResponse("Terjadi kesalahan saat mengeskalasi refund");
  }
}
