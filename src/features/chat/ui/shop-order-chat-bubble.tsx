"use client";

import CustomBadge from "@/components/custom-badge";
import NavButton from "@/components/nav-button";
import { orderStatusMapping } from "@/constant/order-status-mapping";
import { paymentMethodMapping } from "@/constant/payment-method";
import { getOrderSummaryForChatBubble } from "@/features/order/lib/order-queries";
import CompleteOrderDialog from "@/features/order/ui/complete-order-dialog";
import ConfirmOrderDialog from "@/features/order/ui/confirm-order-dialog";
import ConfirmPaymentDialog from "@/features/order/ui/confirm-payment-dialog";
import RejectOrderDialog from "@/features/order/ui/reject-order-dialog";
import RejectPaymentDialog from "@/features/order/ui/reject-payment-dialog";
import { OrderStatus } from "@/generated/prisma";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import { db } from "@/lib/firebase/client";
import { useQuery } from "@tanstack/react-query";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { ChevronRight, FileText, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function ShopOrderChatBubble({
  order_id,
}: {
  order_id: string;
}) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["chat-bubble-order-summary", order_id],
    queryFn: () => getOrderSummaryForChatBubble(order_id),
  });

  const lastKnownUpdate = useRef<number>(
    data?.updated_at.getMilliseconds() ?? 0
  );
  const isFirstRun = useRef(true);

  // Listener ke Firestore untuk trigger timestamp
  useEffect(() => {
    if (!order_id) return;

    const orderRef = doc(db, "orders", order_id);

    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          toast.error("Order tidak ditemukan di Firestore");
          return;
        }

        if (isFirstRun.current) {
          isFirstRun.current = false;
          return;
        }

        const data = snapshot.data();
        const timestamp = data?.lastUpdatedAt as Timestamp | undefined;

        if (!timestamp) return;

        const updateMillis = timestamp.toMillis();

        // Jika timestamp besar berarti ada perubahan
        // Handle ketika pertama kali fetch tidak perlu update
        if (updateMillis > lastKnownUpdate.current) {
          lastKnownUpdate.current = updateMillis;
          refetch();
        }
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
      }
    );

    return () => {
      unsubscribe();
      isFirstRun.current = true;
    };
  }, [order_id, refetch]);

  return (
    <div className={`flex flex-col items-start mb-4`}>
      {isLoading && (
        <div
          className={`h-36 px-4 py-3 shadow rounded-xl bg-card animate-pulse w-[80%]`}
        ></div>
      )}

      {!isLoading && data && (
        <div className={`px-4 py-3 shadow rounded-xl w-[80%] bg-card border`}>
          <div className="w-full flex mb-2 text-primary gap-2 items-center">
            <MessageCircle className="w-5 h-5" />
            <h1 className="text-lg font-semibold">Pesanan Baru</h1>
          </div>

          <div className="mb-4">
            <CustomBadge
              value={data.status}
              outlineValues={[OrderStatus.PENDING_CONFIRMATION]}
            >
              {orderStatusMapping[data.status]}
            </CustomBadge>
          </div>

          <div>
            <div className="mt-1 flex gap-2 flex-col">
              {data.order_items.map((items, idx) => (
                <div
                  key={`${order_id}-${idx}`}
                  className="flex items-center gap-3"
                >
                  <Image
                    src={getImageUrl(items.product.image_url)}
                    width={40}
                    height={40}
                    alt="product image"
                    className="rounded shadow"
                  />

                  <div className="leading-tight">
                    <h1 className="font-medium">
                      {items.quantity}x {items.product.name}
                    </h1>
                    <h1>{formatRupiah(items.subtotal)}</h1>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-4">
              <h1 className="font-medium mb-1">Pembayaran</h1>

              <div className="flex justify-between">
                <h1 className="">Total</h1>

                <h1 className="font-semibold">
                  {formatRupiah(data.total_price)}
                </h1>
              </div>

              <div className="flex justify-between">
                <h1>Metode</h1>

                <h1>{paymentMethodMapping[data.payment_method]}</h1>
              </div>

              <div className="pt-1">
                {data.status === "WAITING_SHOP_CONFIRMATION" &&
                  data.payment_method === "CASH" && (
                    <ConfirmPaymentDialog order_id={order_id} />
                  )}

                {data.status === "WAITING_SHOP_CONFIRMATION" &&
                  data.payment_method !== "CASH" && (
                    <div className="grid grid-cols-2">
                      <ConfirmPaymentDialog order_id={order_id} />

                      <RejectPaymentDialog order_id={order_id} />
                    </div>
                  )}
              </div>
            </div>

            {data.status === "PROCESSING" && (
              <div className="my-4">
                <CompleteOrderDialog order_id={order_id} />
              </div>
            )}

            {data.status === "PENDING_CONFIRMATION" && (
              <div className="flex flex-col gap-3">
                <ConfirmOrderDialog
                  order_id={data.id}
                  payment_method={data.payment_method}
                  shop_id={data.shop.id}
                />

                <RejectOrderDialog order_id={data.id} />
              </div>
            )}

            <NavButton
              className="flex justify-between mt-4 items-center"
              href={"/dashboard-kedai/order/" + order_id}
              size="lg"
              variant="outline"
            >
              Lihat Detail Pesanan
              <ChevronRight />
            </NavButton>
          </div>
        </div>
      )}
    </div>
  );
}
