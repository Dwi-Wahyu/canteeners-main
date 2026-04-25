"use client";

import { useState, useEffect, useRef } from "react";
import { orderStatusMapping } from "@/constant/order-status-mapping";

import CustomBadge from "@/components/custom-badge";
import { OrderStatus } from "@/generated/prisma";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

import Image from "next/image";
import { paymentMethodMapping } from "@/constant/payment-method";
import { postOrderTypeMapping } from "@/constant/post-order-type-mapping";
import CustomerPositionBreadcrumb from "@/features/cart/ui/customer-position-breadcrumb";
import CancelOrderDialog from "./cancel-order-dialog";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatToHour } from "@/helper/hour-helper";
import { GetCustomerOrderDetail } from "../types/order-queries-types";
import ShoppingCartExclamationIcon from "@/components/icons/shopping-cart-exclamation-icon";
import {
  CircleAlert,
  Edit,
  MessageSquareHeart,
  StickyNote,
} from "lucide-react";
import NavButton from "@/components/nav-button";
import { getImageUrl } from "@/helper/get-image-url";
import CashIcon from "@/components/icons/cash-icon";
import { useWatchOrderUpdate } from "@/hooks/use-watch-order-update";
import OrderReviewSection from "./order-review-section";
import OrderComplaintSection from "./order-complaint-section";
import { OrderRefundSection } from "./order-refund-section";
import OrderEstimationCountDown from "./order-estimation-countdown";
import { formatRupiah } from "@/helper/format-rupiah";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNotificationDialogStore } from "@/stores/use-notification-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CustomerOrderDetailClient({
  order: initialOrder,
}: {
  order: GetCustomerOrderDetail;
}) {
  const { orderData } = useWatchOrderUpdate(initialOrder.id);
  const order =
    (orderData as unknown as GetCustomerOrderDetail) || initialOrder;

  const [isLate, setIsLate] = useState(false);
  const showNotification = useNotificationDialogStore((state) => state.show);
  const prevStatusRef = useRef<OrderStatus>(order.status);

  useEffect(() => {
    if (prevStatusRef.current !== "COMPLETED" && order.status === "COMPLETED") {
      showNotification({
        title: "Pesanan Selesai!",
        message:
          "Hore! Pesananmu sudah selesai. Selamat menikmati hidanganmu! 😊",
        type: "success",
        actionButtons: (
          <div className="flex flex-col gap-2 w-full">
            <Button asChild className="w-full">
              <Link href="/testimoni">Beri Kritik & Saran</Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => useNotificationDialogStore.getState().hide()}
            >
              Tutup
            </Button>
          </div>
        ),
      });
    }
    prevStatusRef.current = order.status;
  }, [order.status, showNotification]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const diff = Math.floor(
        (new Date().getTime() - new Date(order.created_at).getTime()) / 1000,
      );
      setElapsedSeconds(diff > 0 ? diff : 0);
    };
    calculateElapsed();
    const timer = setInterval(calculateElapsed, 1000);
    return () => clearInterval(timer);
  }, [order.created_at]);

  useEffect(() => {
    if (
      order.status === "PROCESSING" &&
      order.processed_at &&
      order.estimation
    ) {
      const checkLate = () => {
        const now = new Date().getTime();
        const endTime =
          new Date(order.processed_at!).getTime() + order.estimation! * 60000;
        if (now > endTime) setIsLate(true);
      };
      checkLate();
      const timer = setInterval(checkLate, 5000);
      return () => clearInterval(timer);
    }
  }, [order.status, order.processed_at, order.estimation]);

  const groupedItems = order.order_items.reduce(
    (acc, item) => {
      const productName = item.product.name;
      if (!acc[productName]) {
        acc[productName] = [];
      }
      acc[productName].push(item);
      return acc;
    },
    {} as Record<string, typeof order.order_items>,
  );

  const isGracePeriod = elapsedSeconds <= 10;
  const isWaitPeriod = elapsedSeconds > 10 && elapsedSeconds < 600;

  const showWaitResponseAlert =
    isWaitPeriod && !isLate && order.status === "PENDING_CONFIRMATION";

  const formatTime = (seconds: number) => {
    const totalLeft = Math.max(0, seconds);
    const minutes = Math.floor(totalLeft / 60);
    const remainingSeconds = totalLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const baseCanCancel =
    ![
      "COMPLETED",
      "CANCELLED",
      "REJECTED",
      "WAITING_CUSTOMER_ESTIMATION_CONFIRMATION",
    ].includes(order.status) &&
    (order.status !== "PROCESSING" || isLate);

  const canCancel = baseCanCancel && (isGracePeriod || !isWaitPeriod || isLate);

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-col gap-2">
        {!showWaitResponseAlert && (
          <div>
            <h1 className="font-semibold">Status</h1>

            <CustomBadge
              value={order.status}
              outlineValues={[
                OrderStatus.WAITING_SHOP_CONFIRMATION,
                OrderStatus.WAITING_PAYMENT,
                OrderStatus.PENDING_CONFIRMATION,
              ]}
              successValues={[OrderStatus.COMPLETED]}
              destructiveValues={[OrderStatus.CANCELLED, OrderStatus.REJECTED]}
            >
              {orderStatusMapping[order.status]}
            </CustomBadge>
          </div>
        )}

        {isGracePeriod &&
          !["COMPLETED", "CANCELLED", "REJECTED"].includes(order.status) && (
            <Alert>
              <CircleAlert className="w-4 h-4" />
              <AlertTitle>Masa Tenggang Pembatalan</AlertTitle>
              <AlertDescription>
                Anda memiliki {10 - elapsedSeconds} detik untuk membatalkan
                pesanan jika terjadi kesalahan.
              </AlertDescription>
            </Alert>
          )}

        {showWaitResponseAlert && (
          <Alert className="bg-primary/5 border-primary/20">
            <CircleAlert className="w-4 h-4 text-primary" />
            <AlertTitle className="text-primary">
              Menunggu Respon Kedai
            </AlertTitle>
            <AlertDescription className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Pesanan Anda sedang menunggu konfirmasi dari pihak kedai. Mohon
                tunggu sebentar.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <h1 className="text-lg font-bold text-primary tabular-nums tracking-tight">
                  {formatTime(600 - elapsedSeconds)}
                </h1>
                <span className="text-[10px] font-bold text-muted-foreground uppercase bg-gray-100 px-2 py-0.5 rounded">
                  Sisa Waktu Tunggu
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {order.status === "REJECTED" && (
          <Alert variant={"destructive"}>
            <ShoppingCartExclamationIcon />
            <AlertTitle>Pesanan Ditolak</AlertTitle>
            <AlertDescription>{order.rejected_reason}</AlertDescription>
          </Alert>
        )}

        {order.status === "CANCELLED" &&
          order.cancelled_by_id === order.shop.owner_id && (
            <Alert variant={"destructive"}>
              <ShoppingCartExclamationIcon />
              <AlertTitle>Pesanan Dibatalkan Oleh Pemilik Kedai</AlertTitle>
              <AlertDescription>{order.cancelled_reason}</AlertDescription>
            </Alert>
          )}

        {order.status === "PAYMENT_REJECTED" && (
          <Alert variant={"destructive"}>
            <CircleAlert />
            <AlertTitle>Bukti Pembayaran Ditolak</AlertTitle>
            <AlertDescription>{order.rejected_reason}</AlertDescription>
          </Alert>
        )}

        {order.status === "WAITING_SHOP_CONFIRMATION" &&
          order.payment_method === "CASH" && (
            <Alert variant="default">
              <CashIcon />
              <AlertTitle>Silakan lakukan pembayaran di kedai</AlertTitle>
            </Alert>
          )}

        <div>
          <h1 className="font-semibold mb-1">Pesanan</h1>

          <div className="flex flex-col gap-2">
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedItems).map(([productName, items], idx) => {
                const firstItem = items[0];
                const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
                const totalSubtotal = items.reduce(
                  (sum, i) => sum + i.subtotal,
                  0,
                );

                return (
                  <AccordionItem
                    value={`item-${idx}`}
                    key={idx}
                    className="border rounded-lg px-4 mb-2 last:border-b"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex gap-4 items-center">
                        <img
                          src={getImageUrl(
                            "/product/" + firstItem.product.image_url,
                          )}
                          alt={productName}
                          className="rounded-lg object-cover aspect-square w-16 h-16"
                          onError={(e) =>
                            (e.currentTarget.src = "/placeholder-image.webp")
                          }
                        />
                        <div className="flex flex-col text-left">
                          <h1 className="font-semibold">{productName}</h1>
                          <p className="text-sm text-muted-foreground">
                            {totalQty} Item • {formatRupiah(totalSubtotal)}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-2">
                        {items.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="flex flex-col gap-1 py-2 border-b last:border-0"
                          >
                            <div className="flex justify-between items-center">
                              <h1 className="text-sm font-medium">
                                {item.quantity}x
                              </h1>
                              <h1 className="text-sm font-semibold">
                                {formatRupiah(item.subtotal)}
                              </h1>
                            </div>
                            {item.note && (
                              <div className="flex gap-1 items-center text-xs text-muted-foreground">
                                <StickyNote className="w-3 h-3" />
                                <p>{item.note}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>

        <div>
          <h1 className="font-semibold">Total Harga</h1>
          <h1>{formatRupiah(order.total_price)}</h1>
        </div>

        {order.estimation && (
          <div className="flex flex-col gap-2">
            <div>
              <h1 className="font-semibold">Estimasi</h1>
              <h1>{order.estimation} Menit</h1>
            </div>

            {order.status === "PROCESSING" && (
              <>
                <div>
                  <h1 className="font-semibold">Diproses Pada</h1>
                  <h1>{formatToHour(order.processed_at)}</h1>
                </div>

                <div>
                  <h1 className="font-semibold">Sisa Waktu</h1>
                  {order.processed_at && order.estimation && (
                    <OrderEstimationCountDown
                      estimation={order.estimation}
                      processed_at={order.processed_at}
                      userRole="CUSTOMER"
                      onFinished={() => setIsLate(true)}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div>
          <h1 className="font-semibold">Metode Pembayaran</h1>
          <h1>{paymentMethodMapping[order.payment_method]}</h1>
        </div>

        {(order.status === "WAITING_PAYMENT" ||
          order.status === "PAYMENT_REJECTED") && (
          <NavButton
            href={`/order/${order.id}/pembayaran`}
            size="lg"
            className="w-full mb-4"
          >
            Bayar Sekarang
          </NavButton>
        )}

        <div>
          <h1 className="font-semibold">Jenis Order</h1>
          <div className="p-4 flex flex-col gap-1 rounded-lg border mt-1">
            {order.post_order_type === "DELIVERY_TO_TABLE" &&
            order.customer &&
            order.customer.floor &&
            order.customer.table_number ? (
              <div>
                <h1 className="font-medium">
                  {postOrderTypeMapping[order.post_order_type]}
                </h1>

                <CustomerPositionBreadcrumb
                  canteen_name={order.shop.canteen.name}
                  floor={order.customer.floor}
                  table_number={order.customer.table_number}
                />
                <div className="mt-1">
                  <NavButton
                    href={`/dashboard-pelanggan/kantin/${order.shop.canteen.slug}/pilih-meja`}
                    size="sm"
                  >
                    <Edit />
                    Pilih Ulang
                  </NavButton>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="font-medium">
                  {postOrderTypeMapping[order.post_order_type]}
                </h1>

                <h1 className="text-sm text-muted-foreground">
                  Pesanan diambil di kedai
                </h1>
              </div>
            )}
          </div>
        </div>

        {canCancel && (
          <CancelOrderDialog
            order_id={order.id}
            user_id={order.customer_id}
            order_status={order.status}
            userRole="CUSTOMER"
            isLate={isLate}
            className="mt-4"
          />
        )}
      </div>

      {order.status === "COMPLETED" && (
        <div className="space-y-4">
          <OrderReviewSection
            isUserCustomer={true}
            order_id={order.id}
            prevTestimony={order.testimony}
          />

          <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 flex flex-col items-center text-center gap-3">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquareHeart className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">
                Bantu Canteeners Jadi Lebih Baik
              </h3>
              <p className="text-sm text-muted-foreground">
                Punya kritik atau saran untuk aplikasi Canteeners? Kami sangat
                menghargai masukan Anda!
              </p>
            </div>
            <NavButton
              href="/testimoni"
              variant="outline"
              className="mt-2 border-primary/20 hover:bg-primary/10"
            >
              Beri Kritik & Saran
            </NavButton>
          </div>
        </div>
      )}

      <OrderComplaintSection order={order} />

      <OrderRefundSection order={order as any} userRole="CUSTOMER" />
    </div>
  );
}
