"use client";

import CustomBadge from "@/components/custom-badge";
import NavButton from "@/components/nav-button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orderStatusMapping } from "@/constant/order-status-mapping";
import { getOrderTrackingData } from "@/features/order/lib/order-queries";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { GetOrderTrackingData } from "@/features/order/types/order-queries-types";
import CompleteOrderDialog from "@/features/order/ui/complete-order-dialog";
import ConfirmOrderDialog from "@/features/order/ui/confirm-order-dialog";
import ConfirmPaymentDialog from "@/features/order/ui/confirm-payment-dialog";
import RejectOrderDialog from "@/features/order/ui/reject-order-dialog";
import RejectPaymentDialog from "@/features/order/ui/reject-payment-dialog";
import { OrderStatus } from "@prisma/client";
import { getImageUrl } from "@/helper/get-image-url";
import { useSocket } from "@/lib/realtime/socket-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, SquareArrowOutUpRight, Trash, UserIcon } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function ShopOrderTrackingClient({
  shopId,
  initialData,
}: {
  shopId: string;
  initialData: GetOrderTrackingData;
}) {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["shop-order-tracking", shopId],
    queryFn: () => getOrderTrackingData({ shopId }),
    initialData: initialData,
  });

  useEffect(() => {
    if (!shopId || !socket) return;

    const topic = `shop:${shopId}`;
    socket.join(topic);

    const unsubscribe = socket.on("shop:order-update", () => {
      queryClient.invalidateQueries({
        queryKey: ["shop-order-tracking", shopId],
      });
    });

    return () => {
      socket.leave(topic);
      unsubscribe();
    };
  }, [shopId, socket, queryClient]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-40" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Trash />
          </EmptyMedia>
          <EmptyTitle>Belum Ada Pesanan</EmptyTitle>
          <EmptyDescription>
            Belum ada pesanan terbaru saat ini
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NavButton href="/dashboard-kedai/order/riwayat">
            Lihat Riwayat Pesanan
          </NavButton>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="space-y-2 relative">
            <NavButton
              variant="ghost"
              className="absolute right-4 top-2"
              href={"/dashboard-kedai/order/" + order.id}
              size="icon"
            >
              <SquareArrowOutUpRight className="w-4 h-4" />
            </NavButton>

            <div className="flex gap-2 items-center mb-2">
              <UserIcon className="w-4 h-4 text-muted-foreground" />
              <h1 className="font-medium text-lg">
                {order.customer.user.name}
              </h1>
            </div>

            <div className="mb-3">
              <CustomBadge
                value={order.status}
                outlineValues={[
                  OrderStatus.PENDING_CONFIRMATION,
                  OrderStatus.WAITING_SHOP_CONFIRMATION,
                ]}
                destructiveValues={[
                  OrderStatus.CANCELLED,
                  OrderStatus.PAYMENT_REJECTED,
                ]}
              >
                {orderStatusMapping[order.status]}
              </CustomBadge>
            </div>

            {order.estimation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Estimasi: {order.estimation} Menit</span>
              </div>
            )}

            {order.post_order_type === "DELIVERY_TO_TABLE" &&
              order.customer.table_number && (
                <div className="text-sm bg-muted/50 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span>
                      Meja:{" "}
                      <span className="font-medium">
                        {order.customer.table_number}
                      </span>
                    </span>
                    <span>
                      Lantai:{" "}
                      <span className="font-medium">
                        {order.customer.floor}
                      </span>
                    </span>
                  </div>
                </div>
              )}

            <div className="mt-4 pt-2 border-t space-y-3">
              {order.status === "PROCESSING" && (
                <CompleteOrderDialog order_id={order.id} />
              )}

              {order.status === "WAITING_SHOP_CONFIRMATION" &&
                order.payment_method === "CASH" && (
                  <ConfirmPaymentDialog order_id={order.id} />
                )}

              {order.status === "PENDING_CONFIRMATION" && (
                <div className="grid grid-cols-2 gap-3">
                  <RejectOrderDialog order_id={order.id} />
                  <ConfirmOrderDialog
                    order_id={order.id}
                    payment_method={order.payment_method}
                    shop_id={shopId}
                  />
                </div>
              )}

              {order.payment_method !== "CASH" && order.payment_proof_url && (
                <div className="bg-muted/30 p-3 rounded-lg border">
                  <h1 className="font-medium text-sm mb-2">
                    {order.status === "WAITING_SHOP_CONFIRMATION"
                      ? "Verifikasi Pembayaran"
                      : "Bukti Pembayaran"}
                  </h1>

                  <a
                    href={getImageUrl(
                      "/payment-proof/" + order.payment_proof_url,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-fit group"
                  >
                    <Image
                      className="rounded border group-hover:opacity-90 transition-opacity"
                      width={100}
                      height={100}
                      alt="Bukti pembayaran"
                      src={getImageUrl(
                        "/payment-proof/" + order.payment_proof_url,
                      )}
                    />
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Klik untuk memperbesar
                    </span>
                  </a>

                  {order.status === "WAITING_SHOP_CONFIRMATION" && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <RejectPaymentDialog order_id={order.id} />
                      <ConfirmPaymentDialog order_id={order.id} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
