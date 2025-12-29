"use server";

import { OrderStatus, PaymentMethod } from "@/generated/prisma";
import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { del } from "@vercel/blob";
import { getImageUrl } from "@/helper/get-image-url";
import { paymentMethodMapping } from "@/constant/payment-method";

// --- Helper untuk Revalidasi (DRY Principle) ---
function revalidateOrderPaths(orderId: string) {
  const paths = [`/order/${orderId}`, `/dashboard-kedai/order/${orderId}`];
  paths.forEach((path) => revalidatePath(path));
}

// --- Helper untuk Validasi Metode Pembayaran ---
async function validateShopPaymentMethod(
  shopId: string,
  method: PaymentMethod
) {
  if (method === "CASH") return true; // CASH pembayaran default yang harus ada

  const paymentMethod = await prisma.payment.findFirst({
    where: { shop_id: shopId, method: method },
  });

  return !!paymentMethod;
}

export async function confirmOrder({
  order_id,
  shop_id,
  payment_method,
}: {
  order_id: string;
  shop_id: string;
  payment_method: PaymentMethod;
}): Promise<ServerActionReturn<void>> {
  try {
    // Validasi Ketersediaan Metode Pembayaran di Awal
    // Supaya tidak update status order jika metode tidak tersedia
    const isMethodAvailable = await validateShopPaymentMethod(
      shop_id,
      payment_method
    );

    if (!isMethodAvailable) {
      return errorResponse(
        `Kedai belum menerima pembayaran via ${paymentMethodMapping[payment_method]}`
      );
    }

    // Ambil Data Order
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      select: {
        customer: { select: { user_id: true } },
      },
    });

    if (!order) return errorResponse("Order tidak ditemukan");

    // Tentukan Status & Pesan Berdasarkan Payment Method
    let newStatus: OrderStatus;
    let responseMessage: string;
    let notificationBody: string;

    if (payment_method === "CASH") {
      newStatus = "WAITING_SHOP_CONFIRMATION";
      responseMessage = "Silakan lakukan pembayaran di kedai";
      notificationBody = "Silakan bayar di kedai";
    } else {
      newStatus = "WAITING_PAYMENT";
      responseMessage = "Silakan kirim bukti pembayaran";
      notificationBody = "Silakan kirim bukti pembayaran";
    }

    await prisma.order.update({
      where: { id: order_id },
      data: { status: newStatus },
    });

    // Eksekusi Firebase (Notification & Trigger)
    // jalankan paralel agar lebih cepat menggunakan Promise.all
    const notificationRef = adminDb.collection("notifications");
    const orderRef = adminDb.collection("orders").doc(order_id);

    const notificationPromise = notificationRef.add({
      recipientId: order.customer.user_id,
      type: "ORDER",
      subType: "ACCEPTED",
      title: "Pesanan Diterima",
      body: notificationBody,
      isRead: false,
      intent: "SUCCESS",
      resourcePath: "/order/" + order_id,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: FieldValue.serverTimestamp(),
    });

    const triggerPromise = orderRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });

    await Promise.all([notificationPromise, triggerPromise]);

    revalidateOrderPaths(order_id);

    return successResponse(undefined, responseMessage);
  } catch (error) {
    console.error("Confirm Order Error:", error);
    return errorResponse("Terjadi kesalahan saat mengonfirmasi order");
  }
}

export async function confirmPayment({
  order_id,
  estimation,
}: {
  order_id: string;
  estimation: number;
}): Promise<ServerActionReturn<void>> {
  try {
    const order = await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        status: "PROCESSING",
        processed_at: new Date(),
        estimation,
      },
      select: {
        customer: {
          select: {
            user_id: true,
          },
        },
        shop_id: true,
      },
    });

    const notificationRef = adminDb.collection("notifications");

    // Send notification
    const notificationData = {
      recipientId: order.customer.user_id,
      type: "ORDER",
      subType: "ACCEPTED",
      title: "Pembayaran di Konfirmasi",
      body: "Kedai sudah mulai menyiapkan pesanan anda",
      isRead: false,
      intent: "SUCCESS",
      resourcePath: "/order/" + order_id,
      createdAt: FieldValue.serverTimestamp(),
    };

    await notificationRef.add(notificationData);

    // Update doc order untuk realtime trigger
    const orderRef = adminDb.collection("orders").doc(order_id);

    orderRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });

    revalidateOrderPaths(order_id);

    return successResponse(undefined, "Berhasil konfirmasi pembayaran");
  } catch (error) {
    console.error("confirmPayment Error:", error);
    return errorResponse("Terjadi kesalahan saat konfirmasi pembayaran");
  }
}

export async function changeOrderEstimation({
  estimation,
  order_id,
  status,
}: {
  order_id: string;
  estimation: number;
  status: OrderStatus;
}): Promise<ServerActionReturn<void>> {
  try {
    const updated = await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        estimation,
      },
      select: {
        shop_id: true,
      },
    });

    // Update doc order untuk realtime trigger
    const orderRef = adminDb.collection("orders").doc(order_id);

    orderRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });

    revalidateOrderPaths(order_id);

    return successResponse(undefined, "Berhasil mengubah estimasi");
  } catch (error) {
    return errorResponse("Terjadi kesalahan saat mengubah estimasi");
  }
}

export async function completeOrder({
  order_id,
}: {
  order_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const order = await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        status: "COMPLETED",
      },
      select: {
        customer: {
          select: {
            user_id: true,
          },
        },
        shop_id: true,
      },
    });

    const notificationRef = adminDb.collection("notifications");

    // Send notification
    const notificationData = {
      recipientId: order.customer.user_id,
      type: "ORDER",
      subType: "ACCEPTED",
      title: "Order Selesai",
      body: "Berikan testimoni untuk kedai atau untuk Canteeners 😊🙏",
      isRead: false,
      intent: "SUCCESS",
      resourcePath: "/order/" + order_id,
      createdAt: FieldValue.serverTimestamp(),
    };

    await notificationRef.add(notificationData);

    // Update doc order untuk realtime trigger
    const orderRef = adminDb.collection("orders").doc(order_id);

    orderRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });

    revalidateOrderPaths(order_id);

    return successResponse(undefined, "Berhasil mengubah status");
  } catch (error) {
    console.error("completeOrder Error:", error);
    return errorResponse("Terjadi kesalahan saat mengubah status");
  }
}

export async function rejectOrder({
  order_id,
  rejected_reason,
}: {
  order_id: string;
  rejected_reason: string;
}) {
  try {
    const order = await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        status: "REJECTED",
        rejected_reason,
      },
      select: {
        customer: {
          select: {
            user_id: true,
          },
        },
        shop_id: true,
      },
    });

    const notificationRef = adminDb.collection("notifications");

    // Send notification
    const notificationData = {
      recipientId: order.customer.user_id,
      type: "ORDER",
      subType: "ACCEPTED",
      title: "Pesanan Ditolak",
      body: rejected_reason,
      isRead: false,
      intent: "SUCCESS",
      resourcePath: "/order/" + order_id,
      createdAt: FieldValue.serverTimestamp(),
    };

    await notificationRef.add(notificationData);

    // Update doc order untuk realtime trigger
    const orderRef = adminDb.collection("orders").doc(order_id);

    orderRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });

    revalidateOrderPaths(order_id);

    return successResponse(undefined, "Berhasil menolak order");
  } catch (error) {
    console.error("rejectOrder Error:", error);
    return errorResponse("Terjadi kesalahan saat menolak order");
  }
}

export async function rejectPayment({
  order_id,
  reason,
}: {
  order_id: string;
  reason: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const order = await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        status: "PAYMENT_REJECTED",
        rejected_reason: reason.trim(),
      },
      select: {
        customer: {
          select: {
            user_id: true,
          },
        },
        shop_id: true,
      },
    });

    const notificationRef = adminDb.collection("notifications");

    // Send notification
    const notificationData = {
      recipientId: order.customer.user_id,
      type: "ORDER",
      subType: "ACCEPTED",
      title: "Bukti Pembayaran Ditolak",
      body: reason,
      isRead: false,
      intent: "SUCCESS",
      resourcePath: "/order/" + order_id,
      createdAt: FieldValue.serverTimestamp(),
    };

    await notificationRef.add(notificationData);

    // Update doc order untuk realtime trigger
    const orderRef = adminDb.collection("orders").doc(order_id);

    orderRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });

    revalidateOrderPaths(order_id);

    return successResponse(undefined, "Berhasil menolak pembayaran");
  } catch (error) {
    console.error("rejectPayment Error:", error);
    return errorResponse("Terjadi kesalahan saat menolak pembayaran");
  }
}

export async function cancelOrder({
  order_id,
  cancelled_by_id,
  cancelled_reason,
  order_status,
}: {
  order_id: string;
  cancelled_by_id: string;
  cancelled_reason: string;
  order_status: OrderStatus;
}): Promise<ServerActionReturn<void>> {
  try {
    const updated = await prisma.order.update({
      where: {
        id: order_id,
      },
      data: { cancelled_by_id, status: "CANCELLED", cancelled_reason },
      select: {
        customer: {
          select: {
            user_id: true,
          },
        },
        shop_id: true,
        total_price: true,
        shop: {
          select: {
            refund_disbursement_mode: true,
            owner: {
              select: {
                user_id: true,
              },
            },
          },
        },
      },
    });

    if (order_status === "PROCESSING") {
      await prisma.refund.create({
        data: {
          amount: updated.total_price,
          order_id: order_id,
          disbursement_mode: updated.shop.refund_disbursement_mode,
          reason: "OTHER",
          status: "APPROVED",
          description: "Pembatalan order oleh kedai",
        },
      });
    }

    const notificationRef = adminDb.collection("notifications");

    // Send notification to shop owner
    if (cancelled_by_id === updated.customer.user_id) {
      const notificationData = {
        recipientId: updated.shop.owner.user_id,
        type: "ORDER",
        subType: "CANCELLED",
        title: `Pelanggan Membatalkan Order`,
        body: `Lihat Detail Alasan Membatalkan Order`,
        isRead: false,
        intent: "ERROR",
        resourcePath: `/dashboard-kedai/order/${order_id}`,
        createdAt: FieldValue.serverTimestamp(),
      };

      await notificationRef.add(notificationData);
    } else {
      const notificationData = {
        recipientId: updated.customer.user_id,
        type: "ORDER",
        subType: "CANCELLED",
        title: `Kedai Membatalkan Order`,
        body: `Lihat Detail Alasan Membatalkan Order`,
        isRead: false,
        intent: "ERROR",
        resourcePath: `/order/${order_id}`,
        createdAt: FieldValue.serverTimestamp(),
      };

      await notificationRef.add(notificationData);
    }

    // Update doc order untuk realtime trigger
    const orderRef = adminDb.collection("orders").doc(order_id);

    orderRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });

    revalidateOrderPaths(order_id);

    return successResponse(undefined, "Sukses membatalkan order");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}

export async function savePaymentProof({
  proof_url,
  order_id,
}: {
  proof_url: string;
  order_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
      },
      select: {
        payment_proof_url: true,
        shop_id: true,
        shop: {
          select: {
            owner: {
              select: {
                user_id: true,
              },
            },
          },
        },
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
    });

    if (!order) {
      return errorResponse("Order tidak ditemukan");
    }

    // hapus nanti file yang lama, pastikan pake trycatch biar ga error
    if (order.payment_proof_url) {
      await del(getImageUrl(order.payment_proof_url));
    }

    await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        payment_proof_url: proof_url,
        status: "WAITING_SHOP_CONFIRMATION",
      },
    });

    const notificationRef = adminDb.collection("notifications");

    // Update doc order untuk realtime trigger
    const orderRef = adminDb.collection("orders").doc(order_id);

    orderRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
    });

    // Send notification
    const notificationData = {
      recipientId: order.shop.owner.user_id,
      type: "ORDER",
      subType: "PAYMENT_PROOF_SUBMITTED",
      title: `Pelanggan Mengirim Bukti Pembayaran`,
      body: `Tolong validasi bukti pembayaran ${order.customer.user.name}`,
      isRead: false,
      intent: "SUCCESS",
      resourcePath: `/dashboard-kedai/order/${order_id}/pembayaran`,
      createdAt: FieldValue.serverTimestamp(),
    };

    await notificationRef.add(notificationData);

    revalidateOrderPaths(order_id);

    return successResponse(undefined, "Sukses mengirim bukti pembayaran");
  } catch (error) {
    console.log(error);

    return errorResponse("Silakan Hubungi CS, Atau coba lagi nanti");
  }
}
