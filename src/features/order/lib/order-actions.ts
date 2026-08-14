"use server";

import {
  OrderStatus,
  PaymentMethod,
  RewardType,
  DiscountType,
} from "@prisma/client";
import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deleteFile } from "@/helper/file-helper";
import { paymentMethodMapping } from "@/constant/payment-method";
import { startOfWeek, endOfWeek } from "date-fns";
import { calculateCommission } from "@/helper/pricing-helper";
import {
  createAndPublishNotification,
  publishRealtime,
} from "@/lib/realtime/publish-internal";
import { orderQueue } from "@/lib/queue";
import {
  getPaymentTimeoutMinutes,
  getShopConfirmationTimeoutMinutes,
} from "@/lib/settings";

function revalidateOrderPaths(orderId: string) {
  const paths = [`/order/${orderId}`, `/dashboard-kedai/order/${orderId}`];
  paths.forEach((path) => revalidatePath(path));
}

async function validateShopPaymentMethod(
  shopId: string,
  method: PaymentMethod,
) {
  if (method === "CASH") return true;

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
    const isMethodAvailable = await validateShopPaymentMethod(
      shop_id,
      payment_method,
    );

    if (!isMethodAvailable) {
      return errorResponse(
        `Kedai belum menerima pembayaran via ${paymentMethodMapping[payment_method]}`,
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: order_id },
      select: {
        customer: { select: { user_id: true } },
      },
    });

    if (!order) return errorResponse("Order tidak ditemukan");

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

    await createAndPublishNotification({
      recipient_id: order.customer.user_id,
      type: "ORDER",
      subtype: "ACCEPTED",
      title: "Pesanan Diterima",
      body: notificationBody,
      data: { resourcePath: "/order/" + order_id },
    });

    await publishRealtime(`order:${order_id}`, {
      event: "order:update",
      orderId: order_id,
      status: newStatus,
    });
    await publishRealtime(`shop:${shop_id}`, {
      event: "shop:order-update",
      orderId: order_id,
      status: newStatus,
    });

    revalidateOrderPaths(order_id);

    // Queue Operations: Remove auto-reject job and schedule cancel-unpaid-order job
    try {
      await orderQueue.remove(`auto-reject-${order_id}`);
    } catch (queueError) {
      console.error("Failed to remove auto-reject job from orderQueue:", queueError);
    }

    try {
      const timeoutMinutes = await getPaymentTimeoutMinutes();
      await orderQueue.add(
        "cancel-unpaid-order",
        { orderId: order_id },
        {
          delay: (timeoutMinutes * 60 * 1000) + 15000,
          jobId: order_id,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    } catch (queueError) {
      console.error("Failed to add cancel-unpaid-order job to orderQueue:", queueError);
    }

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
    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
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

      if (updatedOrder.referral_code_used) {
        const referrer = await tx.customer.findUnique({
          where: { referral_code: updatedOrder.referral_code_used },
          select: { id: true, referral_usage_count: true },
        });

        if (referrer && referrer.id !== updatedOrder.customer_id) {
          const newCount = (referrer.referral_usage_count || 0) + 1;

          if (newCount >= 3) {
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

      return updatedOrder;
    });

    await createAndPublishNotification({
      recipient_id: order.customer.user_id,
      type: "ORDER",
      subtype: "ACCEPTED",
      title: "Pembayaran di Konfirmasi",
      body: "Kedai sudah mulai menyiapkan pesanan anda",
      data: { resourcePath: "/order/" + order_id },
    });

    await publishRealtime(`order:${order_id}`, {
      event: "order:update",
      orderId: order_id,
      status: "PROCESSING",
    });
    await publishRealtime(`shop:${order.shop_id}`, {
      event: "shop:order-update",
      orderId: order_id,
      status: "PROCESSING",
    });

    revalidateOrderPaths(order_id);

    // Queue Operations: Remove auto-refund job since shop confirmed payment
    try {
      await orderQueue.remove(`refund-${order_id}`);
    } catch (queueError) {
      console.error("Failed to remove refund job from orderQueue:", queueError);
    }

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

    await publishRealtime(`order:${order_id}`, {
      event: "order:update",
      orderId: order_id,
      status,
      estimation,
    });
    await publishRealtime(`shop:${updated.shop_id}`, {
      event: "shop:order-update",
      orderId: order_id,
      status,
      estimation,
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
        },
      });

      const totalQty = order.order_items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const commission = calculateCommission(totalQty);

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
            net_total: { increment: commission },
          },
        });
      } else {
        await tx.shopBilling.create({
          data: {
            shop_id: order.shop_id,
            start_date: startDate,
            end_date: endDate,
            commission_total: commission,
            subsidy_total: 0,
            refund_total: 0,
            net_total: commission,
            status: "UNPAID",
          },
        });
      }

      return order;
    });

    await createAndPublishNotification({
      recipient_id: result.customer.user_id,
      type: "ORDER",
      subtype: "ACCEPTED",
      title: "Order Selesai",
      body: "Berikan testimoni untuk kedai atau untuk Canteeners 😊🙏",
      data: { resourcePath: "/order/" + order_id },
    });

    await publishRealtime(`order:${order_id}`, {
      event: "order:update",
      orderId: order_id,
      status: "COMPLETED",
    });
    await publishRealtime(`shop:${result.shop_id}`, {
      event: "shop:order-update",
      orderId: order_id,
      status: "COMPLETED",
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

    await createAndPublishNotification({
      recipient_id: order.customer.user_id,
      type: "ORDER",
      subtype: "ACCEPTED",
      title: "Pesanan Ditolak",
      body: rejected_reason,
      data: { resourcePath: "/order/" + order_id },
    });

    await publishRealtime(`order:${order_id}`, {
      event: "order:update",
      orderId: order_id,
      status: "REJECTED",
    });
    await publishRealtime(`shop:${order.shop_id}`, {
      event: "shop:order-update",
      orderId: order_id,
      status: "REJECTED",
    });

    revalidateOrderPaths(order_id);

    // Queue Operations: Remove all pending jobs for this order
    try {
      await orderQueue.remove(order_id);
      await orderQueue.remove(`auto-reject-${order_id}`);
      await orderQueue.remove(`refund-${order_id}`);
    } catch (queueError) {
      console.error("Failed to remove jobs from orderQueue:", queueError);
    }

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

    await createAndPublishNotification({
      recipient_id: order.customer.user_id,
      type: "ORDER",
      subtype: "ACCEPTED",
      title: "Bukti Pembayaran Ditolak",
      body: reason,
      data: { resourcePath: "/order/" + order_id },
    });

    await publishRealtime(`order:${order_id}`, {
      event: "order:update",
      orderId: order_id,
      status: "PAYMENT_REJECTED",
    });
    await publishRealtime(`shop:${order.shop_id}`, {
      event: "shop:order-update",
      orderId: order_id,
      status: "PAYMENT_REJECTED",
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

    const recipientId =
      cancelled_by_id === updated.customer.user_id
        ? updated.shop.owner.user_id
        : updated.customer.user_id;

    await createAndPublishNotification({
      recipient_id: recipientId,
      type: "ORDER",
      subtype: "CANCELLED",
      title:
        cancelled_by_id === updated.customer.user_id
          ? `Pelanggan Membatalkan Order`
          : `Kedai Membatalkan Order`,
      body: `Lihat Detail Alasan Membatalkan Order`,
      data: {
        resourcePath:
          cancelled_by_id === updated.customer.user_id
            ? `/dashboard-kedai/order/${order_id}`
            : `/order/${order_id}`,
      },
    });

    await publishRealtime(`order:${order_id}`, {
      event: "order:update",
      orderId: order_id,
      status: "CANCELLED",
    });
    await publishRealtime(`shop:${updated.shop_id}`, {
      event: "shop:order-update",
      orderId: order_id,
      status: "CANCELLED",
    });

    revalidateOrderPaths(order_id);

    // Queue Operations: Remove all pending jobs for this order
    try {
      await orderQueue.remove(order_id);
      await orderQueue.remove(`auto-reject-${order_id}`);
      await orderQueue.remove(`refund-${order_id}`);
    } catch (queueError) {
      console.error("Failed to remove jobs from orderQueue:", queueError);
    }

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

    await createAndPublishNotification({
      recipient_id: order.shop.owner.user_id,
      type: "ORDER",
      subtype: "PAYMENT_PROOF_SUBMITTED",
      title: `Pelanggan Mengirim Bukti Pembayaran`,
      body: `Tolong validasi bukti pembayaran ${order.customer.user.name}`,
      data: { resourcePath: `/dashboard-kedai/order/${order_id}/pembayaran` },
    });

    await publishRealtime(`order:${order_id}`, {
      event: "order:update",
      orderId: order_id,
      status: "WAITING_SHOP_CONFIRMATION",
    });
    await publishRealtime(`shop:${order.shop_id}`, {
      event: "shop:order-update",
      orderId: order_id,
      status: "WAITING_SHOP_CONFIRMATION",
    });

    revalidateOrderPaths(order_id);

    // Queue Operations: Remove cancel-unpaid-order job (since user uploaded proof) and schedule auto-refund job
    try {
      await orderQueue.remove(order_id);
    } catch (queueError) {
      console.error("Failed to remove cancel-unpaid-order job from orderQueue:", queueError);
    }

    try {
      const confTimeoutMinutes = await getShopConfirmationTimeoutMinutes();
      await orderQueue.remove(`refund-${order_id}`);
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

    return successResponse(undefined, "Sukses mengirim bukti pembayaran");
  } catch (error) {
    console.log(error);
    return errorResponse("Silakan Hubungi CS, Atau coba lagi nanti");
  }
}
