"use client";

import { orderStatusMapping } from "@/constant/order-status-mapping";

import CustomBadge from "@/components/custom-badge";
import { OrderStatus } from "@/generated/prisma";

import { Button } from "@/components/ui/button";
import { paymentMethodMapping } from "@/constant/payment-method";
import { postOrderTypeMapping } from "@/constant/post-order-type-mapping";
import CustomerPositionBreadcrumb from "@/features/cart/ui/customer-position-breadcrumb";
import ConfirmOrderDialog from "./confirm-order-dialog";
import { useState, useTransition } from "react";
import { notificationDialog } from "@/hooks/use-notification-dialog";

import RejectOrderDialog from "./reject-order-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GetShopOrderDetail } from "../types/order-queries-types";
import { getImageUrl } from "@/helper/get-image-url";
import { completeOrder } from "../lib/order-actions";
import ShoppingCartExclamationIcon from "@/components/icons/shopping-cart-exclamation-icon";
import CancelOrderDialog from "./cancel-order-dialog";
import { CircleAlert, Loader, Map, StickyNote } from "lucide-react";
import ConfirmPaymentDialog from "./confirm-payment-dialog";
import RejectPaymentDialog from "./reject-payment-dialog";
import { useWatchOrderUpdate } from "@/hooks/use-watch-order-update";
import OrderEstimationCountDown from "./order-estimation-countdown";
import ShopComplaintSection from "./shop-complaint-section";
import { OrderRefundSection } from "./order-refund-section";
import { formatToHour } from "@/helper/hour-helper";
import { formatRupiah } from "@/helper/format-rupiah";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ImageLightbox } from "@/features/canteen/ui/image-lightbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";

export default function ShopOrderDetailClient({
  order: initialOrder,
}: {
  order: GetShopOrderDetail;
}) {
  const [isPending, startTransition] = useTransition();

  const { orderData } = useWatchOrderUpdate(initialOrder.id);
  const [isOpenProof, setIsOpenProof] = useState(false);
  const order = (orderData as unknown as GetShopOrderDetail) || initialOrder;

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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

  async function handleCompleteOrder() {
    startTransition(async () => {
      const result = await completeOrder({
        order_id: order.id,
      });

      if (result.success) {
        notificationDialog.success({
          title: "Order Telah Selesai !",
          message: "Terima kasih sudah bekerja sama dengan canteeners 😊🙏",
          duration: 3000,
          showLoadingBar: true,
        });
      } else {
        notificationDialog.error({
          title: "Gagal Mengubah Status",
          message: "Silakan hubungi CS",
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 mb-5">
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt={`Denah Lantai ${order.customer.floor}`}
          onClose={() => setLightboxSrc(null)}
        />
      )}

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

      {order.status === "REJECTED" && (
        <Alert variant={"destructive"}>
          <ShoppingCartExclamationIcon />
          <AlertTitle>Alasan Dibatalkan</AlertTitle>
          <AlertDescription>{order.rejected_reason}</AlertDescription>
        </Alert>
      )}

      {order.status === "CANCELLED" &&
        order.cancelled_by_id === order.customer_id && (
          <Alert variant={"destructive"}>
            <ShoppingCartExclamationIcon />
            <AlertTitle>Pesanan Dibatalkan Oleh Pelanggan</AlertTitle>
            <AlertDescription>{order.cancelled_reason}</AlertDescription>
          </Alert>
        )}

      {order.status === "CANCELLED" &&
        order.cancelled_by_id === order.shop.owner?.user_id && (
          <Alert variant={"destructive"}>
            <ShoppingCartExclamationIcon />
            <AlertTitle>Pesanan Dibatalkan Oleh Anda</AlertTitle>
            <AlertDescription>{order.cancelled_reason}</AlertDescription>
          </Alert>
        )}

      {order.status === "CANCELLED" &&
        order.cancelled_by_id === "SYSTEM" && (
          <Alert variant={"destructive"}>
            <CircleAlert className="w-4 h-4 text-destructive" />
            <AlertTitle>Pesanan Dibatalkan Otomatis oleh Sistem</AlertTitle>
            <AlertDescription>{order.cancelled_reason}</AlertDescription>
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

      <div>
        <h1 className="font-semibold">Metode Pembayaran</h1>
        <h1>{paymentMethodMapping[order.payment_method]}</h1>
      </div>

      {order.payment_method === "CASH" &&
        order.status === "WAITING_SHOP_CONFIRMATION" && (
          <div>
            <h1 className="font-semibold mb-1">Konfirmasi Pembayaran Tunai</h1>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CancelOrderDialog
                order_id={order.id}
                order_status={order.status}
                user_id={order.shop.owner?.user_id as string}
                userRole="SHOP_OWNER"
                defaultDisbursementMode={order.shop.refund_disbursement_mode}
              />

              <ConfirmPaymentDialog order_id={order.id} />
            </div>
          </div>
        )}

      {order.payment_method !== "CASH" && (
        <div>
          <h1 className="font-semibold mb-1">Bukti Pembayaran</h1>

          {!order.payment_proof_url ? (
            <div className="text-muted-foreground">
              Belum ada bukti pembayaran
            </div>
          ) : (
            <div>
              <div className="mt-2 relative w-full h-fit max-w-50 overflow-hidden rounded-lg border shadow-sm group">
                <img
                  src={getImageUrl("/payment-proof/" + order.payment_proof_url)}
                  alt="Bukti Pembayaran"
                  className="object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => setIsOpenProof(true)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 italic">
                *Klik gambar untuk memperbesar
              </p>

              <Dialog open={isOpenProof} onOpenChange={setIsOpenProof}>
                <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-visible border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/20 [&>button]:rounded-full [&>button]:p-2 [&>button]:top-[-40px] [&>button]:right-0 sm:[&>button]:right-[-40px] sm:[&>button]:top-0">
                  <VisuallyHidden.Root>
                    <DialogTitle>Bukti Pembayaran</DialogTitle>
                  </VisuallyHidden.Root>
                  <div className="relative w-full h-full max-h-[85vh] flex items-center justify-center">
                    <img
                      src={getImageUrl(
                        "/payment-proof/" + order.payment_proof_url,
                      )}
                      alt="Bukti Pembayaran Full"
                      className="max-w-full max-h-[85vh] object-contain rounded-md"
                    />
                  </div>
                </DialogContent>
              </Dialog>

              {order.status === "WAITING_SHOP_CONFIRMATION" && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <RejectPaymentDialog order_id={order.id} />
                  <ConfirmPaymentDialog order_id={order.id} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
                    userRole="SHOP_OWNER"
                  />
                )}
              </div>
            </>
          )}
        </div>
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
                floor={order.customer.floor ?? 1}
                table_number={order.customer.table_number ?? 1}
              />
              <div className="mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const floorPlan = order.shop.canteen.maps.find(
                      (m) => m.floor === order.customer.floor,
                    );
                    if (floorPlan) {
                      setLightboxSrc(
                        getImageUrl("/canteen-map/" + floorPlan.image_url),
                      );
                    }
                  }}
                >
                  <Map className="mr-2 w-3 h-3" />
                  Lihat Denah
                </Button>
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

      {order.status === "PENDING_CONFIRMATION" && (
        <div>
          <h1 className="font-semibold">Konfirmasi Order</h1>
          <h1 className="text-muted-foreground">
            Pilih terima atau tolak pesanan ini, pastikan stok atau bahan
            tersedia.
          </h1>

          <div className="grid grid-cols-2 mt-2 gap-4">
            <RejectOrderDialog order_id={order.id} />
            <ConfirmOrderDialog
              order_id={order.id}
              payment_method={order.payment_method}
              shop_id={order.shop_id}
            />
          </div>
        </div>
      )}

      {order.status === "PROCESSING" && (
        <div className="mt-2 grid grid-cols-2 gap-4">
          <CancelOrderDialog
            order_id={order.id}
            order_status={order.status}
            user_id={order.shop.owner?.user_id as string}
            userRole="SHOP_OWNER"
            defaultDisbursementMode={order.shop.refund_disbursement_mode}
          />

          <Button
            size={"lg"}
            onClick={handleCompleteOrder}
            disabled={isPending}
          >
            {isPending ? (
              <Loader className="animate-spin" />
            ) : (
              "Pesanan Selesai"
            )}
          </Button>
        </div>
      )}

      <ShopComplaintSection order={order} />

      <OrderRefundSection order={order} userRole="SHOP_OWNER" />
    </div>
  );
}
