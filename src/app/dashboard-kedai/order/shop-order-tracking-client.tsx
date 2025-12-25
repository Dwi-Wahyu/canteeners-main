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
import { OrderStatus } from "@/generated/prisma";
import { getImageUrl } from "@/helper/get-image-url";
import { db } from "@/lib/firebase/client";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { Clock, SquareArrowOutUpRight, Trash, UserIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

export default function ShopOrderTrackingClient({
  shopId,
  initialData,
}: {
  shopId: string;
  initialData: GetOrderTrackingData;
}) {
  const [orders, setOrders] = useState<GetOrderTrackingData>(initialData);

  const [isPending, startTransition] = useTransition();

  const isFirstRun = useRef(true);

  const fetchData = useCallback(() => {
    startTransition(async () => {
      const data = await getOrderTrackingData({ shopId });
      setOrders(data);
    });
  }, [shopId]);

  useEffect(() => {
    if (!shopId) {
      return;
    }

    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("shopId", "==", shopId),
      orderBy("lastUpdatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Pastikan data bukan berasal dari cache lokal (Metadata check)
      // agar tidak double-toast saat offline-to-online
      if (querySnapshot.metadata.hasPendingWrites) return;

      if (!querySnapshot.empty) {
        querySnapshot.docChanges().forEach(async (change) => {
          if (change.type === "added" || change.type === "modified") {
            await fetchData();
          }
        });
      }
    });

    return () => {
      unsubscribe();
      isFirstRun.current = true;
    };
  }, [shopId, fetchData]);

  return (
    <div>
      {isPending && (
        <div className="flex flex-col gap-4">
          <Skeleton className="w-full h-40" />
          <Skeleton className="w-full h-40" />
          <Skeleton className="w-full h-40" />
          <Skeleton className="w-full h-40" />
          <Skeleton className="w-full h-40" />
          <Skeleton className="w-full h-40" />
          <Skeleton className="w-full h-40" />
        </div>
      )}

      {!isPending && orders.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Trash />
            </EmptyMedia>
            <EmptyTitle>Belum Ada Pesanan</EmptyTitle>
            <EmptyDescription>Belum ada pesanan terbaru</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NavButton href="/dashboard-kedai/order/riwayat">
              Lihat Riwayat Pesanan
            </NavButton>
          </EmptyContent>
        </Empty>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order, idx) => (
          <Card key={idx}>
            <CardContent className="space-y-2 relative">
              <NavButton
                variant="ghost"
                className="absolute right-4 top-0"
                href={"/dashboard-kedai/order/" + order.id}
              >
                <SquareArrowOutUpRight />
              </NavButton>

              <div className="flex gap-1 items-center">
                <UserIcon className="w-4 h-4" />
                <h1 className="font-medium">{order.customer.user.name}</h1>
              </div>

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

              {order.estimation && (
                <div>
                  <h1 className="font-medium">Estimasi</h1>
                  <div className="flex gap-1 text-muted-foreground items-center">
                    <Clock className="w-4 h-4" />
                    <h1>{order.estimation} Menit</h1>
                  </div>
                </div>
              )}

              {order.post_order_type === "DELIVERY_TO_TABLE" &&
                order.customer.table_number && (
                  <div>
                    <div>
                      <h1 className="font-medium">Meja</h1>
                      <h1 className="text-muted-foreground">
                        {order.customer.table_number}
                      </h1>
                    </div>
                    <div>
                      <h1 className="font-medium">Lantai</h1>
                      <h1 className="text-muted-foreground">
                        {order.customer.floor}
                      </h1>
                    </div>
                  </div>
                )}

              {order.status === "PROCESSING" && (
                <div>
                  <CompleteOrderDialog order_id={order.id} />
                </div>
              )}

              {order.status === "WAITING_SHOP_CONFIRMATION" &&
                order.payment_method === "CASH" && (
                  <div>
                    <ConfirmPaymentDialog order_id={order.id} />
                  </div>
                )}

              {order.status === "PENDING_CONFIRMATION" && (
                <div className="grid grid-cols-2 gap-2">
                  <RejectOrderDialog order_id={order.id} />
                  <ConfirmOrderDialog
                    order_id={order.id}
                    payment_method={order.payment_method}
                    shop_id={shopId}
                  />
                </div>
              )}

              {order.payment_method !== "CASH" && order.payment_proof_url && (
                <div>
                  <h1 className="font-medium">
                    {order.status === "WAITING_SHOP_CONFIRMATION"
                      ? "Verifikasi"
                      : "Bukti"}{" "}
                    Pembayaran
                  </h1>
                  <div className="my-1 block">
                    <Image
                      className="rounded"
                      width={100}
                      height={100}
                      alt="Bukti pembayaran"
                      src={getImageUrl(order.payment_proof_url)}
                    />
                    <h1 className="text-xs mt-0.5 text-muted-foreground">
                      Klik gambar untuk lihat bukti pembayaran
                    </h1>
                  </div>

                  {order.status === "WAITING_SHOP_CONFIRMATION" && (
                    <div className="grid grid-cols-2 gap-4">
                      <RejectPaymentDialog order_id={order.id} />
                      <ConfirmPaymentDialog order_id={order.id} />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
