"use server";

import { auth } from "@/config/auth";
import {
  RefundRequestInput,
  UpdateRefundStatusInput,
  ProcessRefundInput,
  CancelRefundInput,
  EscalateRefundInput,
  CompleteRefundInput,
} from "@/features/shop/refund/types/refund-schema";
import { Role } from "@/generated/prisma";
import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { calculateCommission } from "@/helper/pricing-helper";
import { adminDb } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";
import { refundQueue } from "@/lib/queue";
import { endOfWeek, startOfWeek } from "date-fns";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

function revalidateRefundPaths(orderId: string) {
  const paths = [
    `/order/${orderId}`,
    `/order/${orderId}/refund`,
    `/dashboard-kedai/order/${orderId}`,
    `/dashboard-kedai/order/${orderId}/refund`,
    `/dashboard-kedai/order`,
    `/dashboard-kedai/refund`,
  ];
  paths.forEach((path) => revalidatePath(path));
}

export async function createRefundRequest(
  payload: RefundRequestInput,
): Promise<ServerActionReturn<void>> {
  const session = await auth();
  if (!session) return errorResponse("Unauthorized");

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
                avatar: true,
              },
            },
          },
        },
        shop: {
          select: {
            owner_id: true,
            name: true,
            owner: {
              select: {
                user_id: true,
              },
            },
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
        "Refund hanya dapat diminta untuk pesanan yang sudah selesai",
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
        payload.affected_item_ids!.includes(item.id),
      );

      if (affectedItems.length !== payload.affected_item_ids.length) {
        return errorResponse("Beberapa item tidak valid");
      }

      refundAmount = affectedItems.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );
    } else {
      // Use provided amount
      if (!payload.amount) {
        return errorResponse("Jumlah refund harus diisi");
      }

      if (payload.amount > order.total_price) {
        return errorResponse(
          "Jumlah refund tidak boleh melebihi total pesanan",
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
        history: {
          create: {
            status: "PENDING",
            note: "Refund diajukan oleh customer",
            actor_id: session.user.id,
            actor_name: session.user.name,
            actor_role: session.user.role as any,
          },
        },
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

    // Sync to Firestore & Send notification
    const refundRef = adminDb.collection("refunds").doc(refund.id);
    const orderRef = adminDb.collection("orders").doc(payload.order_id);

    const triggerPromise = refundRef.set({
      refundId: refund.id,
      orderId: payload.order_id,
      shopOwnerUserId: order.shop.owner.user_id,
      customerUserId: order.customer.user_id,
      status: "PENDING",
      amount: refundAmount,
      reason: payload.reason,
      disbursementMode: payload.disbursement_mode,
      requestedAt: FieldValue.serverTimestamp(),
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });

    const orderTriggerPromise = orderRef.set(
      {
        lastUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // Schedule reminder job 12 hours after refund is created
    await refundQueue.add(
      "notify-pending-refund",
      { refundId: refund.id },
      {
        delay: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
        jobId: `refund-reminder-${refund.id}`, // Unique jobId to avoid duplicates
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    // Send notification to shop owner
    const notificationRef = adminDb.collection("notifications");
    const notificationData = {
      recipientId: order.shop.owner.user_id,
      type: "REFUND",
      subType: "REQUESTED",
      title: "Permintaan Refund Baru",
      body: `Customer mengajukan refund sebesar Rp ${refundAmount.toLocaleString(
        "id-ID",
      )} untuk pesanan #${order.id.substring(0, 8)}`,
      isRead: false,
      intent: "WARNING",
      resourcePath: `/dashboard-kedai/order/${order.id}`,
      createdAt: FieldValue.serverTimestamp(),
      senderInfo: {
        name: order.customer.user.name,
        avatar: order.customer.user.avatar,
      },
      metadata: {
        refundId: refund.id,
        amount: refundAmount,
        reason: payload.reason,
      },
    };

    const notificationPromise = notificationRef.add(notificationData);

    await Promise.all([
      triggerPromise,
      orderTriggerPromise,
      notificationPromise,
    ]);

    revalidateRefundPaths(order.id);

    return successResponse(undefined, "Permintaan refund berhasil diajukan");
  } catch (error) {
    console.error("createRefundRequest Error:", error);
    return errorResponse("Terjadi kesalahan saat mengajukan refund");
  }
}

export async function updateRefundStatus(
  payload: UpdateRefundStatusInput,
): Promise<ServerActionReturn<void>> {
  const session = await auth();
  if (!session) return errorResponse("Unauthorized");

  try {
    const refund = await prisma.refund.findUnique({
      where: {
        id: payload.refund_id,
      },
      include: {
        history: true,
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

    // Lock if admin has made a decision
    const hasAdminIntervened = refund.history.some(
      (h) => h.actor_role === "ADMIN",
    );
    if (hasAdminIntervened) {
      return errorResponse(
        "Status refund sudah final karena keputusan admin dan tidak dapat diubah lagi",
      );
    }

    if (refund.status !== "PENDING") {
      return errorResponse(
        "Hanya refund dengan status PENDING yang dapat diproses",
      );
    }

    // Update refund status
    await prisma.refund.update({
      where: {
        id: payload.refund_id,
      },
      data: {
        status: payload.status,
        rejected_reason:
          payload.status === "REJECTED" ? payload.rejected_reason : null,
        processed_at: payload.status === "APPROVED" ? new Date() : null,
        history: {
          create: {
            status: payload.status,
            note:
              payload.status === "REJECTED"
                ? `Refund ditolak: ${payload.rejected_reason}`
                : "Refund disetujui oleh kedai",
            actor_id: session.user.id,
            actor_name: session.user.name,
            actor_role: session.user.role as any,
          },
        },
      },
    });

    // Send notification to customer
    const notificationRef = adminDb.collection("notifications");

    let notificationTitle: string;
    let notificationBody: string;
    let notificationIntent: "SUCCESS" | "WARNING";

    if (payload.status === "APPROVED") {
      notificationTitle = "Refund Disetujui";
      notificationBody = `Pengajuan refund Anda sebesar Rp ${refund.amount.toLocaleString(
        "id-ID",
      )} telah disetujui`;
      notificationIntent = "SUCCESS";
    } else {
      notificationTitle = "Refund Ditolak";
      notificationBody =
        "Pengajuan refund Anda ditolak. Lihat alasan untuk detail lebih lanjut";
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

    const notificationPromise = notificationRef.add(notificationData);

    const refundRef = adminDb.collection("refunds").doc(refund.id);
    const orderRef = adminDb.collection("orders").doc(refund.order_id);

    const triggerPromise = refundRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
      status: payload.status,
    });

    const orderTriggerPromise = orderRef.set(
      {
        lastUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await Promise.all([
      notificationPromise,
      triggerPromise,
      orderTriggerPromise,
    ]);

    revalidateRefundPaths(refund.order_id);

    return successResponse(
      undefined,
      payload.status === "APPROVED"
        ? "Refund berhasil disetujui"
        : "Refund ditolak",
    );
  } catch (error) {
    console.error("updateRefundStatus Error:", error);
    return errorResponse("Terjadi kesalahan saat memproses refund");
  }
}

export async function processRefund(
  payload: ProcessRefundInput,
): Promise<ServerActionReturn<void>> {
  const session = await auth();
  if (!session) return errorResponse("Unauthorized");

  try {
    const refund = await prisma.refund.findUnique({
      where: {
        id: payload.refund_id,
      },
      include: {
        history: true,
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

    // Lock if admin has made a decision
    const hasAdminIntervened = refund.history.some(
      (h) => h.actor_role === "ADMIN",
    );
    if (hasAdminIntervened) {
      return errorResponse(
        "Status refund sudah final karena keputusan admin dan tidak dapat diubah lagi",
      );
    }

    if (refund.status !== "APPROVED") {
      return errorResponse(
        "Hanya refund yang sudah disetujui yang dapat diproses",
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
        history: {
          create: {
            status: "PROCESSED",
            note:
              refund.disbursement_mode === "CASH"
                ? "Dana telah diserahkan ke pelanggan"
                : "Dana refund telah dikirim ke customer",
            actor_id: session.user.id,
            actor_name: session.user.name,
            actor_role: session.user.role as any,
          },
        },
      },
    });

    // Send notification to customer
    const notificationRef = adminDb.collection("notifications");
    const notificationData = {
      recipientId: refund.order.customer.user_id,
      type: "REFUND",
      subType: "DISBURSED",
      title:
        refund.disbursement_mode === "CASH"
          ? "Konfirmasi Dana Diterima"
          : "Dana Refund Dikirim",
      body:
        refund.disbursement_mode === "CASH"
          ? "Dana refund telah diserahkan ke Anda. Mohon konfirmasi penerimaan dana."
          : "Dana refund telah dikirim ke rekening Anda. Mohon konfirmasi penerimaan dana kepada kedai.",
      isRead: false,
      intent: "SUCCESS",
      resourcePath: `/order/${refund.order_id}`,
      createdAt: FieldValue.serverTimestamp(),
      metadata: {
        amount: refund.amount,
        disbursementMode: refund.disbursement_mode,
        refundId: refund.id,
      },
      duration: 0,
      showLoadingBar: false,
      buttons: [
        {
          label: "Konfirmasi Dana Diterima",
          actionPath: `/order/refund/${refund.id}/confirm?back_url=/order/${refund.order_id}`,
          variant: "default",
        },
      ],
    };

    const notificationPromise = notificationRef.add(notificationData);

    const refundRef = adminDb.collection("refunds").doc(refund.id);
    const orderRef = adminDb.collection("orders").doc(refund.order_id);

    const triggerPromise = refundRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
      status: "PROCESSED",
    });

    const orderTriggerPromise = orderRef.set(
      {
        lastUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await Promise.all([
      notificationPromise,
      triggerPromise,
      orderTriggerPromise,
    ]);

    revalidateRefundPaths(refund.order_id);

    return successResponse(undefined, "Refund berhasil diproses");
  } catch (error) {
    console.error("processRefund Error:", error);
    return errorResponse("Terjadi kesalahan saat memproses refund");
  }
}

export async function cancelRefund(
  payload: CancelRefundInput,
): Promise<ServerActionReturn<void>> {
  const session = await auth();
  if (!session) return errorResponse("Unauthorized");

  try {
    const refund = await prisma.refund.findUnique({
      where: {
        id: payload.refund_id,
      },
      include: {
        history: true,
        order: {
          select: {
            id: true,
            shop: {
              select: {
                owner_id: true,
                owner: {
                  select: {
                    user_id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!refund) {
      return errorResponse("Refund tidak ditemukan");
    }

    // Lock if admin has made a decision
    const hasAdminIntervened = refund.history.some(
      (h) => h.actor_role === "ADMIN",
    );
    if (hasAdminIntervened) {
      return errorResponse(
        "Status refund sudah final karena keputusan admin dan tidak dapat diubah lagi",
      );
    }

    if (refund.status !== "PENDING") {
      return errorResponse(
        "Hanya refund dengan status PENDING yang dapat dibatalkan",
      );
    }

    // Update to CANCELLED status
    await prisma.refund.update({
      where: {
        id: payload.refund_id,
      },
      data: {
        status: "CANCELLED",
        history: {
          create: {
            status: "CANCELLED",
            note: "Refund dibatalkan oleh customer",
            actor_id: session.user.id,
            actor_name: session.user.name,
            actor_role: session.user.role as any,
          },
        },
      },
    });

    // Send notification to shop owner
    // const notificationRef = adminDb.collection("notifications");
    // const notificationData = {
    //   recipientId: refund.order.shop.owner.user_id,
    //   type: "REFUND",
    //   subType: "CANCELLED",
    //   title: "Refund Dibatalkan",
    //   body: "Customer membatalkan permintaan refund untuk pesanan ini",
    //   isRead: false,
    //   intent: "INFO",
    //   resourcePath: `/dashboard-kedai/order/${refund.order_id}`,
    //   createdAt: FieldValue.serverTimestamp(),
    // };

    // const notificationPromise = notificationRef.add(notificationData);

    const refundRef = adminDb.collection("refunds").doc(refund.id);
    const orderRef = adminDb.collection("orders").doc(refund.order_id);

    const triggerPromise = refundRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
      status: "CANCELLED",
    });

    const orderTriggerPromise = orderRef.set(
      {
        lastUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // await Promise.all([notificationPromise, triggerPromise]);
    await Promise.all([triggerPromise, orderTriggerPromise]);

    revalidateRefundPaths(refund.order_id);

    return successResponse(undefined, "Refund berhasil dibatalkan");
  } catch (error) {
    console.error("cancelRefund Error:", error);
    return errorResponse("Terjadi kesalahan saat membatalkan refund");
  }
}

export async function escalateRefund(
  payload: EscalateRefundInput,
): Promise<ServerActionReturn<void>> {
  const session = await auth();
  if (!session) return errorResponse("Unauthorized");

  try {
    const refund = await prisma.refund.findUnique({
      where: {
        id: payload.refund_id,
      },
      include: {
        history: true,
        order: {
          select: {
            customer: {
              select: {
                user_id: true,
              },
            },
            shop: {
              select: {
                owner: {
                  select: {
                    user_id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!refund) {
      return errorResponse("Refund tidak ditemukan");
    }

    // Lock if admin has made a decision
    const hasAdminIntervened = refund.history.some(
      (h) => h.actor_role === "ADMIN",
    );
    if (hasAdminIntervened) {
      return errorResponse(
        "Status refund sudah final karena keputusan admin dan tidak dapat diubah lagi",
      );
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
        history: {
          create: {
            status: "ESCALATED",
            note: payload.escalated_reason,
            actor_id: session.user.id,
            actor_name: session.user.name,
            actor_role: session.user.role as Role,
          },
        },
      },
    });

    // Send notification to shop owner
    const notificationRef = adminDb.collection("notifications");
    const notificationData = {
      recipientId:
        session.user.role === "SHOP_OWNER"
          ? refund.order.customer.user_id
          : refund.order.shop.owner.user_id,
      type: "REFUND",
      subType: "COMPLETED",
      title: "Refund Dieskalasi",
      body: `Refund untuk pesanan #${refund.order_id.substring(0, 8)} telah dieskalasi ke admin`,
      isRead: false,
      intent: "SUCCESS",
      resourcePath:
        session.user.role === "SHOP_OWNER"
          ? `/order/${refund.order_id}/refund`
          : `/dashboard-kedai/order/${refund.order_id}/refund`,
      createdAt: FieldValue.serverTimestamp(),
    };

    const notificationPromise = await notificationRef.add(notificationData);

    const refundRef = adminDb.collection("refunds").doc(refund.id);
    const orderRef = adminDb.collection("orders").doc(refund.order_id);

    const triggerPromise = refundRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
      status: "ESCALATED",
    });

    const orderTriggerPromise = orderRef.set(
      {
        lastUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await Promise.all([
      notificationPromise,
      triggerPromise,
      orderTriggerPromise,
    ]);

    revalidateRefundPaths(refund.order_id);

    return successResponse(undefined, "Refund berhasil dieskalasi ke admin");
  } catch (error) {
    console.error("escalateRefund Error:", error);
    return errorResponse("Terjadi kesalahan saat mengeskalasi refund");
  }
}

export async function completeRefund(
  payload: CompleteRefundInput,
): Promise<ServerActionReturn<void>> {
  const session = await auth();
  if (!session) return errorResponse("Unauthorized");

  try {
    const refund = await prisma.refund.findUnique({
      where: {
        id: payload.refund_id,
      },
      include: {
        history: true,
        order: {
          select: {
            id: true,
            shop: {
              select: {
                owner_id: true,
                owner: {
                  select: {
                    user_id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!refund) {
      return errorResponse("Refund tidak ditemukan");
    }

    if (refund.status !== "PROCESSED") {
      return errorResponse(
        "Hanya refund dengan status PROCESSED yang dapat dikonfirmasi",
      );
    }

    // Update to COMPLETED status
    await prisma.$transaction(async (tx) => {
      await tx.refund.update({
        where: {
          id: payload.refund_id,
        },
        data: {
          status: "COMPLETED",
          history: {
            create: {
              status: "COMPLETED",
              note: "Customer mengonfirmasi bahwa dana refund telah diterima",
              actor_id: session.user.id,
              actor_name: session.user.name,
              actor_role: session.user.role as Role,
            },
          },
        },
      });

      // --- LOGIKA BILLING: PENGURANGAN KOMISI KARENA REFUND ---
      // Ambil detail refund untuk menghitung qty yang dikurangi
      const refundDetail = await tx.refund.findUnique({
        where: { id: payload.refund_id },
        include: {
          order: {
            include: {
              order_items: {
                select: {
                  quantity: true,
                },
              },
            },
          },
          affected_items: {
            include: {
              order_item: {
                select: {
                  quantity: true,
                },
              },
            },
          },
        },
      });

      if (refundDetail) {
        const totalOriginalQty = refundDetail.order.order_items.reduce(
          (sum, i) => sum + i.quantity,
          0,
        );
        const refundedQty = refundDetail.affected_items.reduce(
          (sum, i) => sum + i.order_item.quantity,
          0,
        );

        // Jika alasan refund adalah keterlambatan (LATE_DELIVERY) atau alasan global lainnya
        // yang tidak memilih item spesifik (affected_items kosong),
        // maka kita anggap refund proporsional terhadap amount?
        // Namun instruksi user: "pengurangan sesuai jumlah qty item yang direfund"

        if (refundedQty > 0) {
          const originalCommission = calculateCommission(totalOriginalQty);
          const remainingCommission = calculateCommission(
            Math.max(0, totalOriginalQty - refundedQty),
          );
          const commissionToRefund = originalCommission - remainingCommission;

          const now = new Date();
          const startDate = startOfWeek(now, { weekStartsOn: 1 });
          const endDate = endOfWeek(now, { weekStartsOn: 1 });

          const existingBilling = await tx.shopBilling.findFirst({
            where: {
              shop_id: refundDetail.order.shop_id,
              start_date: startDate,
              end_date: endDate,
            },
          });

          if (existingBilling) {
            await tx.shopBilling.update({
              where: { id: existingBilling.id },
              data: {
                refund_total: { increment: commissionToRefund },
                net_total: { decrement: commissionToRefund },
              },
            });
          } else {
            // Jika belum ada billing di minggu ini (kasus jarang), buat baru
            await tx.shopBilling.create({
              data: {
                shop_id: refundDetail.order.shop_id,
                start_date: startDate,
                end_date: endDate,
                commission_total: 0,
                subsidy_total: 0,
                refund_total: commissionToRefund,
                net_total: -commissionToRefund,
                status: "UNPAID",
              },
            });
          }
        }
      }
    });

    // Send notification to shop owner
    // const notificationRef = adminDb.collection("notifications");
    // const notificationData = {
    //   recipientId: refund.order.shop.owner.user_id,
    //   type: "REFUND",
    //   subType: "COMPLETED",
    //   title: "Refund Selesai",
    //   body: `Customer telah mengonfirmasi penerimaan dana refund untuk pesanan #${refund.order.id.substring(
    //     0,
    //     8,
    //   )}`,
    //   isRead: false,
    //   intent: "SUCCESS",
    //   resourcePath: `/dashboard-kedai/order/${refund.order_id}`,
    //   createdAt: FieldValue.serverTimestamp(),
    // };

    // const notificationPromise = await notificationRef.add(notificationData);

    const refundRef = adminDb.collection("refunds").doc(refund.id);
    const orderRef = adminDb.collection("orders").doc(refund.order_id);

    const triggerPromise = refundRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
      status: "COMPLETED",
    });

    const orderTriggerPromise = orderRef.set(
      {
        lastUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await Promise.all([triggerPromise, orderTriggerPromise]);

    revalidateRefundPaths(refund.order_id);

    return successResponse(undefined, "Refund berhasil diselesaikan");
  } catch (error) {
    console.error("completeRefund Error:", error);
    return errorResponse("Terjadi kesalahan saat menyelesaikan refund");
  }
}
