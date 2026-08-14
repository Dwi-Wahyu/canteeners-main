"use client";

import CustomBadge from "@/components/custom-badge";
import CashIcon from "@/components/icons/cash-icon";
import NavButton from "@/components/nav-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { orderStatusMapping } from "@/constant/order-status-mapping";
import { paymentMethodMapping } from "@/constant/payment-method";
import { getOrderSummaryForChatBubble } from "@/features/order/lib/order-queries";
import { OrderStatus } from "@prisma/client";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import { useSocket } from "@/lib/realtime/socket-context";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, MapPin, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function CustomerOrderChatBubble({
  order_id,
}: {
  order_id: string;
}) {
  const socket = useSocket();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["chat-bubble-order-summary", order_id],
    queryFn: () => getOrderSummaryForChatBubble(order_id),
  });

  useEffect(() => {
    if (!order_id || !socket) return;

    const topic = `order:${order_id}`;
    socket.join(topic);

    const unsubscribe = socket.on("order:update", () => {
      refetch();
    });

    return () => {
      socket.leave(topic);
      unsubscribe();
    };
  }, [order_id, socket, refetch]);

  return (
    <div className={`flex flex-col items-end mb-4`}>
      {isLoading && (
        <div
          className={`h-36 animate-pulse w-[80%] px-4 py-3 shadow bg-secondary rounded-xl`}
        ></div>
      )}

      {!isLoading && data && (
        <div className={`px-4 py-3 shadow rounded-xl w-[80%] bg-card border`}>
          <div className="w-full flex flex-col gap-2">
            <div className="flex text-primary gap-2 items-center">
              <ShoppingBag className="w-5 h-5" />
              <h1 className="text-lg font-semibold">Pesanan Anda</h1>
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
              <div className="mt-1">
                {data.order_items.map((items, idx) => (
                  <div
                    key={`${order_id}-${idx}`}
                    className="flex items-center gap-3"
                  >
                    <Image
                      src={getImageUrl("/product/" + items.product.image_url)}
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

              {data.post_order_type !== "TAKEAWAY" &&
                data.customer.table_number && (
                  <div className="my-4">
                    <div className="my-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Meja: {data.customer.table_number} Lantai:{" "}
                      {data.customer.floor}
                    </div>
                  </div>
                )}

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
              </div>

              {data.payment_method === "CASH" &&
                data.status === "WAITING_SHOP_CONFIRMATION" && (
                  <Alert variant={"destructive"}>
                    <CashIcon />
                    <AlertDescription>Silakan bayar di kedai</AlertDescription>
                  </Alert>
                )}

              <NavButton
                className="flex mt-4 justify-between items-center"
                href={"/order/" + order_id}
                variant="outline"
                size="lg"
              >
                Lihat Detail Pesanan
                <ChevronRight />
              </NavButton>

              {data.status === "WAITING_PAYMENT" && (
                <div className="w-full mt-4">
                  <NavButton
                    className="w-full"
                    href={`/order/${data.id}/pembayaran`}
                  >
                    Bayar Sekarang
                  </NavButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
