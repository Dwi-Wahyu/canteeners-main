"use server";

import { OrderStatus, PaymentMethod } from "@/generated/prisma";
import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin"; // Import Firebase Admin
import { FieldValue } from "firebase-admin/firestore"; // Import FieldValue

export async function confirmOrder({
  order_id,
  conversation_id,
  owner_id,
  shop_id,
  payment_method,
  estimation,
}: {
  order_id: string;
  conversation_id: string;
  shop_id: string;
  owner_id: string;
  payment_method: PaymentMethod;
  estimation: number;
}): Promise<ServerActionReturn<void>> {
  try {
    if (payment_method === "CASH") {
      await prisma.order.update({
        where: {
          id: order_id,
        },
        data: {
          status: "WAITING_SHOP_CONFIRMATION",
          estimation,
        },
      });

      revalidatePath("/dashboard-kedai/order/" + order_id);
      revalidatePath("/dashboard-pelanggan/order/" + order_id);

      return successResponse(undefined, "Silakan lakukan pembayaran di kedai");
    }

    await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        status: "WAITING_PAYMENT",
        estimation,
      },
    });

    // Reference ke collection messages di Firestore
    const messagesRef = adminDb
      .collection("chats")
      .doc(conversation_id)
      .collection("messages");

    if (payment_method === "QRIS") {
      const shopQRISPayments = await prisma.payment.findFirst({
        where: {
          shop_id,
          method: "QRIS",
        },
      });

      if (!shopQRISPayments) {
        console.error("kedai belum menerima pembayaran qris");
        return errorResponse("kedai belum menerima pembayaran qris");
      }

      // Kirim Pesan Firebase (Tipe Image dengan Attachment)
      await messagesRef.add({
        senderId: owner_id,
        text: "Silakan kirim bukti pembayaran",
        type: "image", // Tipe pesan image
        order_id: order_id,
        attachments: [
          {
            url: shopQRISPayments.qr_url!,
            type: "image",
          },
        ],
        readBy: [owner_id],
        createdAt: FieldValue.serverTimestamp(),
      });

      revalidatePath("/dashboard-kedai/order/" + order_id);
      revalidatePath("/dashboard-pelanggan/order/" + order_id);

      return successResponse(undefined, "Silakan kirim bukti pembayaran");
    }

    if (payment_method === "BANK_TRANSFER") {
      const shopBankTransferPayments = await prisma.payment.findFirst({
        where: {
          shop_id,
          method: "BANK_TRANSFER",
        },
      });

      if (!shopBankTransferPayments) {
        console.error("kedai belum menerima pembayaran transfer bank");
        return errorResponse("kedai belum menerima pembayaran transfer bank");
      }

      // Kirim Pesan Firebase (Tipe Text)
      await messagesRef.add({
        senderId: owner_id,
        text: `Silakan transfer pada nomor rekening ${shopBankTransferPayments.account_number} ${shopBankTransferPayments.note}`,
        type: "text",
        order_id: order_id,
        attachments: [],
        readBy: [owner_id],
        createdAt: FieldValue.serverTimestamp(),
      });

      revalidatePath("/dashboard-kedai/order/" + order_id);
      revalidatePath("/dashboard-pelanggan/order/" + order_id);

      return successResponse(undefined, "Silakan kirim bukti pembayaran");
    }

    return errorResponse("Metode pembayaran tidak valid");
  } catch (error) {
    console.error("confirmOrder Error:", error);
    return errorResponse("Terjadi kesalahan saat mengonfirmasi order");
  }
}

export async function confirmPayment({
  conversation_id,
  order_id,
  owner_id,
}: {
  order_id: string;
  conversation_id: string;
  owner_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        status: "PROCESSING",
        processed_at: new Date(),
      },
    });

    // Kirim Pesan Firebase (Konfirmasi Pembayaran)
    await adminDb
      .collection("chats")
      .doc(conversation_id)
      .collection("messages")
      .add({
        senderId: owner_id,
        text: "Pesanan anda sedang diproses",
        type: "system", // Gunakan 'system' atau 'text' sesuai kebutuhan UI
        order_id: order_id,
        attachments: [],
        readBy: [owner_id],
        createdAt: FieldValue.serverTimestamp(),
      });

    revalidatePath(`/dashboard-kedai/order/${order_id}`);
    revalidatePath(`/dashboard-pelanggan/order/${order_id}`);

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
    await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        estimation,
      },
    });

    revalidatePath(`/dashboard-kedai/order/${order_id}`);
    revalidatePath(`/dashboard-pelanggan/order/${order_id}`);

    return successResponse(undefined, "Berhasil mengubah estimasi");
  } catch (error) {
    return errorResponse("Terjadi kesalahan saat mengubah estimasi");
  }
}

export async function completeOrder({
  conversation_id,
  order_id,
  owner_id,
}: {
  order_id: string;
  conversation_id: string;
  owner_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        status: "COMPLETED",
      },
    });

    // Kirim Pesan Firebase (Order Selesai)
    await adminDb
      .collection("chats")
      .doc(conversation_id)
      .collection("messages")
      .add({
        senderId: owner_id,
        text: "Pesanan telah selesai silakan berikan ulasan atau rating untuk kami kak 🙏",
        type: "system", // Gunakan 'system' atau 'text'
        order_id: order_id,
        attachments: [],
        readBy: [owner_id],
        createdAt: FieldValue.serverTimestamp(),
      });

    revalidatePath(`/dashboard-kedai/order/${order_id}`);
    revalidatePath(`/dashboard-pelanggan/order/${order_id}`);

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
    await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        status: "REJECTED",
        rejected_reason,
      },
    });

    revalidatePath(`/dashboard-kedai/order/${order_id}`);
    revalidatePath(`/dashboard-pelanggan/order/${order_id}`);

    return successResponse(undefined, "Berhasil menolak order");
  } catch (error) {
    console.error("rejectOrder Error:", error);
    return errorResponse("Terjadi kesalahan saat menolak order");
  }
}

export async function RejectPayment({
  order_id,
  reason,
}: {
  order_id: string;
  reason: string;
}): Promise<ServerActionReturn<void>> {
  try {
    await prisma.order.update({
      where: {
        id: order_id,
      },
      data: {
        status: "PAYMENT_REJECTED",
        rejected_reason: reason.trim(),
      },
    });

    revalidatePath(`/dashboard-kedai/order/${order_id}`);
    revalidatePath(`/dashboard-pelanggan/order/${order_id}`);

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
        total_price: true,
        shop: {
          select: {
            refund_disbursement_mode: true,
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

    revalidatePath("/dashboard-kedai/order/" + order_id);
    revalidatePath("/dashboard-pelanggan/order/" + order_id);

    return successResponse(undefined, "Sukses membatalkan order");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}
