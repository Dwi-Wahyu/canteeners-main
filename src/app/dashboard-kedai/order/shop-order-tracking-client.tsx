"use client";

import CustomBadge from "@/components/custom-badge";
import NavButton from "@/components/nav-button";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  Clock,
  SquareArrowOutUpRight,
  Trash,
  UserIcon,
  ClipboardCheck,
  Wallet,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import OrderEstimationCountDown from "@/features/order/ui/order-estimation-countdown";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function ShopOrderTrackingClient({
  shopId,
  initialData,
}: {
  shopId: string;
  initialData: GetOrderTrackingData;
}) {
  const queryClient = useQueryClient();

  // initialData dipakai agar SSR berfungsi (user langsung melihat data tanpa loading spinner)
  const { data: orders, isLoading } = useQuery({
    queryKey: ["shop-order-tracking", shopId],
    queryFn: () => getOrderTrackingData({ shopId }),
    initialData: initialData,
  });

  // 2. Setup Firestore Listener untuk Realtime Update
  useEffect(() => {
    if (!shopId) return;

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("shopId", "==", shopId),
      orderBy("lastUpdatedAt", "asc"),
    );

    let isInitialSnapshot = true;

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.metadata.hasPendingWrites) return;

      if (isInitialSnapshot) {
        isInitialSnapshot = false;
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["shop-order-tracking", shopId],
      });
    });

    return () => {
      unsubscribe();
    };
  }, [shopId, queryClient]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-16" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Belum Ada Pesanan</EmptyTitle>
          <EmptyDescription>
            Belum ada pesanan terbaru saat ini
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const now = new Date().getTime();
  const stats = {
    accepted: orders.filter((o) => o.status === "PROCESSING").length,
    pending: orders.filter((o) => o.status === "PENDING_CONFIRMATION").length,
    waitingPayment: orders.filter((o) =>
      ["WAITING_PAYMENT", "WAITING_SHOP_CONFIRMATION"].includes(o.status),
    ).length,
    late: orders.filter((o) => {
      if (o.status !== "PROCESSING" || !o.processed_at || !o.estimation)
        return false;
      const endTime = new Date(o.processed_at).getTime() + o.estimation * 60000;
      return now > endTime;
    }).length,
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-card-foreground shadow-xs">
          <ClipboardCheck className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Diterima:</span>
          <span className="text-sm font-bold">{stats.accepted}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-card-foreground shadow-xs">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Konfirmasi:</span>
          <span className="text-sm font-bold">{stats.pending}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-card-foreground shadow-xs">
          <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Pembayaran:</span>
          <span className="text-sm font-bold">{stats.waitingPayment}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-card-foreground shadow-xs">
          <AlertCircle
            className={`w-3.5 h-3.5 ${stats.late > 0 ? "text-destructive" : "text-muted-foreground"}`}
          />
          <span className="text-xs font-medium">Terlambat:</span>
          <span
            className={`text-sm font-bold ${stats.late > 0 ? "text-destructive" : ""}`}
          >
            {stats.late}
          </span>
        </div>
      </div>

      <Accordion type="multiple" className="w-full">
        {orders.map((order) => (
          <AccordionItem key={order.id} value={order.id} className="mb-2">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex flex-1 justify-between items-center pr-2">
                <div className="flex flex-col items-start text-left">
                  <h1 className="font-medium">{order.customer.user.name}</h1>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-[200px]">
                    {order.order_items && order.order_items.length > 0
                      ? order.order_items
                          .map(
                            (item) => `${item.quantity}x ${item.product.name}`,
                          )
                          .join(", ")
                      : "Tidak ada item"}
                  </div>
                  <div className="mt-1">
                    <CustomBadge
                      className="text-[10px] px-1.5 h-5"
                      value={order.status}
                      outlineValues={[
                        OrderStatus.PENDING_CONFIRMATION,
                        OrderStatus.WAITING_SHOP_CONFIRMATION,
                      ]}
                    >
                      {orderStatusMapping[order.status]}
                    </CustomBadge>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  {order.status === "PROCESSING" &&
                  order.processed_at &&
                  order.estimation ? (
                    <div className="scale-75 origin-right -mr-2">
                      <OrderEstimationCountDown
                        estimation={order.estimation}
                        processed_at={order.processed_at}
                        userRole="SHOP_OWNER"
                      />
                    </div>
                  ) : (
                    <>
                      {order.estimation && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{order.estimation} Min</span>
                        </div>
                      )}
                    </>
                  )}
                  {order.post_order_type === "DELIVERY_TO_TABLE" && (
                    <span className="text-[10px] font-medium bg-muted px-1.5 rounded mt-1">
                      Lt {order.customer.floor} - Meja{" "}
                      {order.customer.table_number}
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Detail Lengkap
                  </span>
                  <NavButton
                    variant="outline"
                    className="h-8 text-xs"
                    href={
                      "/dashboard-kedai/order/" +
                      order.id +
                      "?back_url=/dashboard-kedai/order"
                    }
                    size="sm"
                  >
                    Buka Detail{" "}
                    <SquareArrowOutUpRight className="ml-2 w-3 h-3" />
                  </NavButton>
                </div>

                <div className="space-y-3">
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

                  {order.payment_method !== "CASH" &&
                    order.payment_proof_url && (
                      <div className="bg-muted/30 p-3 rounded-lg border">
                        <h1 className="font-medium text-xs mb-2">
                          {order.status === "WAITING_SHOP_CONFIRMATION"
                            ? "Verifikasi Pembayaran"
                            : "Bukti Pembayaran"}
                        </h1>

                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="block w-fit group">
                              <Image
                                className="rounded border group-hover:opacity-90 transition-opacity"
                                width={80}
                                height={80}
                                alt="Bukti pembayaran"
                                src={getImageUrl(
                                  "/payment-proof/" + order.payment_proof_url,
                                )}
                              />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl p-1 bg-transparent border-none">
                            <div className="relative w-full aspect-auto flex items-center justify-center">
                              <img
                                src={getImageUrl(
                                  "/payment-proof/" + order.payment_proof_url,
                                )}
                                alt="Bukti pembayaran full"
                                className="max-h-[90vh] w-auto rounded-lg shadow-2xl"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>

                        {order.status === "WAITING_SHOP_CONFIRMATION" && (
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <RejectPaymentDialog order_id={order.id} />
                            <ConfirmPaymentDialog order_id={order.id} />
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
