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
import { prisma } from "@/lib/prisma";
import { createAndPublishNotification } from "@/lib/realtime/publish-internal";

export async function createRefundRequest(
  payload: RefundRequestInput
): Promise<ServerActionReturn<void>> {
  try {
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

    if (order.status !== "COMPLETED") {
      return errorResponse(
        "Refund hanya dapat diminta untuk pesanan yang sudah selesai"
      );
    }

    if (order.refund) {
      return errorResponse("Refund sudah pernah diajukan untuk pesanan ini");
    }

    let refundAmount: number;
    const isItemLevel = [
      "DAMAGED_FOOD",
      "MISSING_ITEM",
      "WRONG_ORDER",
    ].includes(payload.reason);

    if (isItemLevel) {
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

    await createAndPublishNotification({
      recipient_id: order.shop.owner_id,
      type: "REFUND",
      subtype: "REQUESTED",
      title: "Permintaan Refund Baru",
      body: `Customer mengajukan refund sebesar Rp ${refundAmount.toLocaleString(
        "id-ID"
      )} untuk pesanan #${order.id.substring(0, 8)}`,
      data: {
        refundId: refund.id,
        amount: refundAmount,
        reason: payload.reason,
        resourcePath: `/dashboard-kedai/order/${order.id}`,
      },
    });

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

    await prisma.refund.update({
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

    let notificationTitle: string;
    let notificationBody: string;

    if (payload.status === "APPROVED") {
      notificationTitle = "Refund Disetujui";
      notificationBody = `Permintaan refund Anda sebesar Rp ${refund.amount.toLocaleString(
        "id-ID"
      )} telah disetujui`;
    } else {
      notificationTitle = "Refund Ditolak";
      notificationBody =
        "Permintaan refund Anda ditolak. Lihat alasan untuk detail lebih lanjut";
    }

    await createAndPublishNotification({
      recipient_id: refund.order.customer.user_id,
      type: "REFUND",
      subtype: payload.status === "APPROVED" ? "APPROVED" : "REJECTED",
      title: notificationTitle,
      body: notificationBody,
      data: {
        resourcePath: `/order/${refund.order_id}`,
        rejectedReason: payload.rejected_reason,
        amount: refund.amount,
      },
    });

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

    await prisma.refund.update({
      where: {
        id: payload.refund_id,
      },
      data: {
        status: "PROCESSED",
        disbursement_proof_url: payload.disbursement_proof_url,
      },
    });

    await createAndPublishNotification({
      recipient_id: refund.order.customer.user_id,
      type: "REFUND",
      subtype: "DISBURSED",
      title: "Dana Refund Telah Dikirim",
      body: `Dana refund sebesar Rp${refund.amount.toLocaleString(
        "id-ID"
      )} telah dikirim melalui ${
        refund.disbursement_mode === "CASH" ? "tunai" : "transfer"
      }`,
      data: {
        resourcePath: `/order/${refund.order_id}`,
        amount: refund.amount,
        disbursementMode: refund.disbursement_mode,
      },
    });

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

    await prisma.refund.update({
      where: {
        id: payload.refund_id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    await createAndPublishNotification({
      recipient_id: refund.order.shop.owner_id,
      type: "REFUND",
      subtype: "CANCELLED",
      title: "Refund Dibatalkan",
      body: "Customer membatalkan permintaan refund untuk pesanan ini",
      data: { resourcePath: `/dashboard-kedai/order/${refund.order_id}` },
    });

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

    await prisma.refund.update({
      where: {
        id: payload.refund_id,
      },
      data: {
        status: "ESCALATED",
        escalated_reason: payload.escalated_reason,
      },
    });

    return successResponse(undefined, "Refund berhasil dieskalasi ke admin");
  } catch (error) {
    console.error("escalateRefund Error:", error);
    return errorResponse("Terjadi kesalahan saat mengeskalasi refund");
  }
}
