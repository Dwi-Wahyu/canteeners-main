"use server";

import {
  OrderStatus,
  PaymentMethod,
  RewardType,
  DiscountType,
  RefundDisbursementMode,
} from "@/generated/prisma";
import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { deleteFile } from "@/helper/file-helper";
import { paymentMethodMapping } from "@/constant/payment-method";
import { startOfWeek, endOfWeek } from "date-fns";
import { calculateCommission } from "@/helper/pricing-helper";
import { orderQueue } from "@/lib/queue";
import {
  getPaymentTimeoutMinutes,
  getShopConfirmationTimeoutMinutes,
} from "@/lib/settings";

// --- Helper untuk Revalidasi (DRY Principle) ---
function revalidateOrderPaths(orderId: string) {
  const paths = [
    `/order/${orderId}`,
    `/dashboard-kedai/order/${orderId}`,
    `/dashboard-kedai/order`,
  ];
  paths.forEach((path) => revalidatePath(path));
}

// --- Helper untuk Validasi Metode Pembayaran ---
async function validateShopPaymentMethod(
  shopId: string,
  method: PaymentMethod,
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
      payment_method,
    );

    if (!isMethodAvailable) {
      return errorResponse(
        `Kedai belum menerima pembayaran via ${paymentMethodMapping[payment_method]}`,
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
      data: { status: newStatus, confirmed_at: new Date() },
    });

    const timeoutMinutes = await getPaymentTimeoutMinutes();

    // Add job to BullMQ queue for automatic cancellation
    try {
      await orderQueue.add(
        "cancel-unpaid-order",
        { orderId: order_id },
        {
          delay: timeoutMinutes * 60 * 1000,
          jobId: order_id,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    } catch (queueError) {
      console.error("Failed to add job to orderQueue:", queueError);
      // We don't want to fail the whole action if the queue fails,
      // but in a production environment, this might be critical.
    }

    // Eksekusi Firebase (Notification & Trigger)
    // jalankan paralel agar lebih cepat menggunakan Promise.all
    const notificationRef = adminDb.collection("notifications");
    const orderRef = adminDb.collection("orders").doc(order_id);

    const notificationPromise = notificationRef.add({
      recipientId: order.customer.user_id,
      type: "ORDER",
      subType: "ACCEPTED",
      title: "Pesanan Diterima",
      body: `${notificationBody}. Batas waktu pembayaran ${timeoutMinutes} menit.`,
      isRead: false,
      intent: "SUCCESS",
      resourcePath: `/order/${order_id}`,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: FieldValue.serverTimestamp(),
    });

    const triggerPromise = orderRef.set(
      {
        lastUpdatedAt: FieldValue.serverTimestamp(),
        status: newStatus,
      },
      { merge: true },
    );
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
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: {
          id: order_id,
        },
        data: {
          status: "PROCESSING",
          processed_at: new Date(),
          estimation,
        },
        select: {
          customer_id: true,
          referral_code_used: true,
          customer: {
            select: {
              user_id: true,
            },
          },
          shop_id: true,
        },
      });

      // --- LOGIKA REFERRAL ---
      if (order.referral_code_used) {
        const referrer = await tx.customer.findUnique({
          where: { referral_code: order.referral_code_used },
          select: { id: true, referral_usage_count: true },
        });

        // Tandai customer ini sudah pernah menggunakan referral dan simpan kodenya
        await tx.customer.update({
          where: { id: order.customer_id },
          data: {
            has_used_referral: true,
            used_referral_code: order.referral_code_used,
          },
        });

        // Pastikan referrer ada dan bukan dirinya sendiri
        if (referrer && referrer.id !== order.customer_id) {
          const newCount = (referrer.referral_usage_count || 0) + 1;

          if (newCount >= 3) {
            // Berikan Reward Cashback ke Referrer
            let refDiscount = await tx.discount.findFirst({
              where: {
                name: "Referral Reward",
                value: 10000,
                reward_type: RewardType.CASHBACK,
              },
            });

            if (!refDiscount) {
              refDiscount = await tx.discount.create({
                data: {
                  name: "Referral Reward",
                  value: 10000,
                  type: DiscountType.FIXED,
                  reward_type: RewardType.CASHBACK,
                  status: "ACTIVE",
                },
              });
            }

            await tx.customerDiscount.create({
              data: {
                customer_id: referrer.id,
                discount_id: refDiscount.id,
              },
            });

            // Reset Counter
            await tx.customer.update({
              where: { id: referrer.id },
              data: { referral_usage_count: 0 },
            });
          } else {
            await tx.customer.update({
              where: { id: referrer.id },
              data: { referral_usage_count: newCount },
            });
          }
        }
      }

      return order;
    });

    // Remove job from BullMQ queue (Safety measure, especially for CASH payments)
    try {
      await orderQueue.remove(order_id);
    } catch (queueError) {
      console.error("Failed to remove job from orderQueue:", queueError);
    }

    // Eksekusi Firebase diluar transaksi agar tidak menghambat database
    const notificationRef = adminDb.collection("notifications");

    // Send notification
    const notificationData = {
      recipientId: result.customer.user_id,
      type: "ORDER",
      subType: "PAYMENT_APPROVED",
      title: "Pembayaran di Konfirmasi",
      body: "Kedai sudah mulai menyiapkan pesanan anda",
      isRead: false,
      intent: "SUCCESS",
      resourcePath: `/order/${order_id}`,
      createdAt: FieldValue.serverTimestamp(),
    };

    const notificationPromise = notificationRef.add(notificationData);

    // Update doc order untuk realtime trigger
    const orderRef = adminDb.collection("orders").doc(order_id);

    const triggerPromise = orderRef.set(
      {
        lastUpdatedAt: FieldValue.serverTimestamp(),
        status: "PROCESSING",
      },
      { merge: true },
    );

    await Promise.all([notificationPromise, triggerPromise]);

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
      status: status,
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
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
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
          order_items: {
            select: {
              quantity: true,
            },
          },
          applied_discounts: {
            include: {
              discount: {
                select: {
                  shop_id: true,
                },
              },
            },
          },
        },
      });

      // --- LOGIKA BILLING & SUBSIDI ---
      const totalQty = order.order_items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const commission = calculateCommission(totalQty);

      // Hitung subsidi: Diskon yang tidak memiliki shop_id (ditanggung platform)
      const platformSubsidy = order.applied_discounts.reduce((sum, ad) => {
        // Jika discount_id null atau shop_id pada discount null, berarti subsidi platform
        if (!ad.discount || ad.discount.shop_id === null) {
          return sum + ad.amount;
        }
        return sum;
      }, 0);

      const now = new Date();
      const startDate = startOfWeek(now, { weekStartsOn: 1 });
      const endDate = endOfWeek(now, { weekStartsOn: 1 });

      const existingBilling = await tx.shopBilling.findFirst({
        where: {
          shop_id: order.shop_id,
          start_date: startDate,
          end_date: endDate,
        },
      });

      if (existingBilling) {
        await tx.shopBilling.update({
          where: { id: existingBilling.id },
          data: {
            commission_total: { increment: commission },
            subsidy_total: { increment: platformSubsidy },
            net_total: { increment: commission - platformSubsidy },
          },
        });
      } else {
        await tx.shopBilling.create({
          data: {
            shop_id: order.shop_id,
            start_date: startDate,
            end_date: endDate,
            commission_total: commission,
            subsidy_total: platformSubsidy,
            refund_total: 0,
            net_total: commission - platformSubsidy,
            status: "UNPAID",
          },
        });
      }

      return order;
    });

    const notificationRef = adminDb.collection("notifications");

    // Send notification
    const notificationData = {
      recipientId: result.customer.user_id,
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

    // Hapus doc order dari tracking aktif
    const orderRef = adminDb.collection("orders").doc(order_id);
    await orderRef.delete();

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

    // Remove job from BullMQ queue
    try {
      await orderQueue.remove(order_id);
    } catch (queueError) {
      console.error("Failed to remove job from orderQueue:", queueError);
    }

    const notificationRef = adminDb.collection("notifications");

    // Send notification
    const notificationData = {
      recipientId: order.customer.user_id,
      type: "ORDER",
      subType: "REJECTED",
      title: "Pesanan Ditolak",
      body: rejected_reason,
      isRead: false,
      intent: "SUCCESS",
      resourcePath: "/order/" + order_id,
      createdAt: FieldValue.serverTimestamp(),
    };

    await notificationRef.add(notificationData);

    // Hapus doc order dari tracking aktif
    const orderRef = adminDb.collection("orders").doc(order_id);
    await orderRef.delete();

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
      subType: "REJECTED",
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

    await orderRef.set(
      {
        lastUpdatedAt: FieldValue.serverTimestamp(),
        status: "PAYMENT_REJECTED",
      },
      { merge: true },
    );
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
  disbursement_mode,
}: {
  order_id: string;
  cancelled_by_id: string;
  cancelled_reason: string;
  order_status: OrderStatus;
  disbursement_mode?: RefundDisbursementMode;
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
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
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

    // Remove job from BullMQ queue
    try {
      await orderQueue.remove(order_id);
    } catch (queueError) {
      console.error("Failed to remove job from orderQueue:", queueError);
    }

    const isShopCancellation = cancelled_by_id === updated.shop.owner?.user_id;

    if (order_status === "PROCESSING") {
      await prisma.refund.create({
        data: {
          amount: updated.total_price,
          order_id: order_id,
          disbursement_mode:
            disbursement_mode || updated.shop.refund_disbursement_mode,
          reason: isShopCancellation ? "SHOP_CANCELLATION" : "OTHER",
          status: "APPROVED",
          description: cancelled_reason,
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
        body: `Lihat Alasan Membatalkan Order`,
        isRead: false,
        intent: "ERROR",
        resourcePath: `/dashboard-kedai/order/${order_id}`,
        createdAt: FieldValue.serverTimestamp(),
        senderInfo: {
          name: updated.customer.user.name,
          avatar: updated.customer.user.avatar,
        },
      };

      await notificationRef.add(notificationData);
    } else {
      const notificationData = {
        recipientId: updated.customer.user_id,
        type: "ORDER",
        subType: "CANCELLED",
        title: `Kedai Membatalkan Order`,
        body: `Lihat Alasan Membatalkan Order`,
        isRead: false,
        intent: "ERROR",
        resourcePath: isShopCancellation ? "/" : `/order/${order_id}`,
        createdAt: FieldValue.serverTimestamp(),
      };

      await notificationRef.add(notificationData);
    }

    // Hapus doc order dari tracking aktif
    const orderRef = adminDb.collection("orders").doc(order_id);
    await orderRef.delete();

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
                avatar: true,
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
      await deleteFile(order.payment_proof_url);
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

    // Remove job from BullMQ queue (cancel-unpaid-order)
    try {
      await orderQueue.remove(order_id);
    } catch (queueError) {
      console.error("Failed to remove job from orderQueue:", queueError);
    }

    // Trigger BullMQ untuk auto-refund jika shop tidak konfirmasi
    try {
      const confTimeoutMinutes = await getShopConfirmationTimeoutMinutes();
      await orderQueue.add(
        "auto-refund-unconfirmed-payment",
        { orderId: order_id },
        {
          delay: confTimeoutMinutes * 60 * 1000,
          jobId: `refund-${order_id}`,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    } catch (queueError) {
      console.error("Failed to add auto-refund job to orderQueue:", queueError);
    }

    const notificationRef = adminDb.collection("notifications");

    // Update doc order untuk realtime trigger
    const orderRef = adminDb.collection("orders").doc(order_id);

    orderRef.update({
      lastUpdatedAt: FieldValue.serverTimestamp(),
      status: "WAITING_SHOP_CONFIRMATION",
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
      resourcePath: `/dashboard-kedai/order/${order_id}`,
      createdAt: FieldValue.serverTimestamp(),
      senderInfo: {
        name: order.customer.user.name,
        avatar: order.customer.user.avatar,
      },
    };

    await notificationRef.add(notificationData);

    revalidateOrderPaths(order_id);

    return successResponse(undefined, "Sukses mengirim bukti pembayaran");
  } catch (error) {
    console.log(error);

    return errorResponse("Silakan Hubungi CS, Atau coba lagi nanti");
  }
}

export async function timeoutCancelOrder({
  order_id,
}: {
  order_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      select: {
        status: true,
        customer_id: true,
        customer: { select: { user_id: true } },
        shop_id: true,
        payment_method: true,
        payment_proof_url: true,
      },
    });

    if (!order) return errorResponse("Order tidak ditemukan");

    // Validasi apakah order bisa dibatalkan otomatis
    // 1. Status WAITING_PAYMENT (untuk non-CASH)
    // 2. Status WAITING_SHOP_CONFIRMATION dengan method CASH (karena belum bayar di kedai)
    const isWaitingNonCash = order.status === "WAITING_PAYMENT";
    const isWaitingCash =
      order.status === "WAITING_SHOP_CONFIRMATION" &&
      order.payment_method === "CASH" &&
      !order.payment_proof_url;

    if (!isWaitingNonCash && !isWaitingCash) {
      return errorResponse("Order tidak bisa dibatalkan otomatis");
    }

    await prisma.$transaction(async (tx) => {
      // Update Status Order
      await tx.order.update({
        where: { id: order_id },
        data: {
          status: "CANCELLED",
          cancelled_reason:
            "Batas waktu pembayaran berakhir, pesanan dibatalkan otomatis oleh sistem dan tercatat sebagai pelanggaran.",
          cancelled_by_id: "SYSTEM",
        },
      });

      // Catat Pelanggaran
      await tx.customerViolation.create({
        data: {
          customer_id: order.customer_id,
          order_id: order_id,
          timestamp: new Date(),
          type: "ORDER_CANCEL_WITHOUT_PAY",
        },
      });

      // Cek apakah sudah mencapai batas 3 pelanggaran hari ini
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayViolationCount = await tx.customerViolation.count({
        where: {
          customer_id: order.customer_id,
          type: "ORDER_CANCEL_WITHOUT_PAY",
          timestamp: {
            gte: startOfDay,
          },
        },
      });

      if (todayViolationCount >= 3) {
        const suspendUntil = new Date();
        suspendUntil.setDate(suspendUntil.getDate() + 1); // Bekukan 24 jam

        await tx.customer.update({
          where: { id: order.customer_id },
          data: {
            suspend_until: suspendUntil,
            suspend_reason:
              "Akun dibekukan sementara karena pembatalan pesanan otomatis yang berulang (3x hari ini).",
          },
        });
      }
    });

    // Remove job from BullMQ queue
    try {
      await orderQueue.remove(order_id);
    } catch (queueError) {
      console.error("Failed to remove job from orderQueue:", queueError);
    }

    // Firebase Cleanup
    const orderRef = adminDb.collection("orders").doc(order_id);
    await orderRef.delete();

    const notificationRef = adminDb.collection("notifications");
    await notificationRef.add({
      recipientId: order.customer.user_id,
      type: "ORDER",
      subType: "CANCELLED",
      title: "Pesanan Dibatalkan Otomatis",
      body: "Batas waktu pembayaran telah berakhir, pesanan dibatalkan otomatis dan tercatat sebagai pelanggaran.",
      isRead: false,
      intent: "ERROR",
      resourcePath: "/order/" + order_id,
      createdAt: FieldValue.serverTimestamp(),
    });

    revalidateOrderPaths(order_id);

    return successResponse(
      undefined,
      "Pesanan dibatalkan otomatis karena timeout",
    );
  } catch (error) {
    console.error("Timeout Cancel Order Error:", error);
    return errorResponse("Terjadi kesalahan saat membatalkan order otomatis");
  }
}
