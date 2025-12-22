"use client";

import CustomBadge from "@/components/custom-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { orderStatusMapping } from "@/constant/order-status-mapping";
import {
  getPaymentMethodIcon,
  paymentMethodMapping,
} from "@/constant/payment-method";
import { OrderStatus } from "@/generated/prisma";
import { formatDateTimeIndonesian } from "@/helper/date-helper";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import { useWatchOrderUpdate } from "@/hooks/use-watch-order-update";
import { Calendar, FileText, HandPlatter, MapPin } from "lucide-react";
import Image from "next/image";
import { postOrderTypeMapping } from "@/constant/post-order-type-mapping";
import RunIcon from "@/components/icons/run-icon";
import NavButton from "@/components/nav-button";
import { Button } from "@/components/ui/button";
import ConfirmPaymentDialog from "./confirm-payment-dialog";
import RejectPaymentDialog from "./reject-payment-dialog";

export default function ShopOrderDetailDialog({
  order_id,
  trigger,
}: {
  order_id: string;
  trigger: React.ReactNode;
}) {
  const { orderData, loading } = useWatchOrderUpdate(order_id);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>{" "}
      <DialogContent className="p-0">
        <DialogHeader className="flex-row border-b p-4 justify-between items-center">
          <DialogTitle>Detail Pesanan</DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-0">
          {loading && <div className="text-center">Memuat...</div>}

          {!loading && orderData && (
            <div className="flex flex-col gap-4">
              {!loading && orderData && (
                <CustomBadge
                  value={orderData.status}
                  outlineValues={[OrderStatus.PENDING_CONFIRMATION]}
                  warningValues={[
                    OrderStatus.WAITING_SHOP_CONFIRMATION,
                    OrderStatus.WAITING_PAYMENT,
                  ]}
                >
                  {orderStatusMapping[orderData.status]}
                </CustomBadge>
              )}

              <h1 className="font-medium">Informasi Pesanan</h1>

              <div className="shadow text-muted-foreground rounded-lg flex-col gap-2 flex p-4">
                <div className="flex gap-2">
                  <Calendar className="w-5 h-5" />

                  <h1>{formatDateTimeIndonesian(orderData.created_at)}</h1>
                </div>

                <div className="flex gap-2">
                  <FileText className="w-5 h-5" />

                  <h1>Pelanggan: {orderData.customer.user.name}</h1>
                </div>

                <div className="flex gap-2">
                  {orderData.post_order_type === "DELIVERY_TO_TABLE" ? (
                    <HandPlatter className="w-5 h-5" />
                  ) : (
                    <RunIcon className="w-5 h-5" />
                  )}

                  <h1>{postOrderTypeMapping[orderData.post_order_type]}</h1>
                </div>

                {orderData.post_order_type === "DELIVERY_TO_TABLE" && (
                  <div className="flex gap-2">
                    <MapPin className="w-5 h-5" />

                    <h1>Meja: {orderData.customer.table_number}</h1>
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="w-5 h-5">
                    {getPaymentMethodIcon({
                      paymentMethod: orderData.payment_method,
                      className: "w-5 h-5",
                    })}
                  </div>

                  <h1>
                    Pembayaran: {paymentMethodMapping[orderData.payment_method]}
                  </h1>
                </div>
              </div>

              {/* Fokus tampilkan bukti pembayaran */}
              {orderData.status !== "WAITING_SHOP_CONFIRMATION" && (
                <>
                  <h1 className="font-medium">Item Pesanan</h1>

                  <div className="flex flex-col gap-2">
                    {orderData.order_items.map((orderItem, idx) => (
                      <Card className="p-2" key={idx}>
                        <CardContent className="p-2">
                          <div className="flex gap-4">
                            <Image
                              src={getImageUrl(orderItem.product.image_url)}
                              alt={orderItem.product.name}
                              width={70}
                              height={70}
                              className="rounded-lg object-cover aspect-square"
                            />
                            <div className="w-full">
                              <div className="flex justify-between items-center w-full">
                                <h1 className="font-semibold text-start">
                                  {orderItem.product.name}
                                </h1>
                              </div>

                              <h1 className="text-sm text-muted-foreground">
                                {formatRupiah(orderItem.subtotal)}
                              </h1>

                              <div className="flex mt-1 flex-wrap gap-2">
                                {orderItem.selected_options.map(
                                  (options, idx) => (
                                    <Badge variant={"outline"} key={idx}>
                                      {options.value}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          </div>

                          {/* {orderItem.notes && (
                        <div className="flex gap-1 items-center mt-3 text-muted-foreground">
                          <StickyNote className="w-4 h-4" />
                          <h1>{orderItem.notes}</h1>
                        </div>
                      )} */}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              <div>
                <h1 className="font-medium">Pembayaran</h1>

                <h1 className="text-lg text-primary">
                  {formatRupiah(orderData.total_price)}
                </h1>

                {orderData.payment_proof_url && (
                  <div>
                    <h1>Bukti</h1>
                    <Image
                      src={getImageUrl(orderData.payment_proof_url)}
                      alt="Bukti Pembayaran"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {/* <NavButton
                  variant="default"
                  size="lg"
                  href={"/dashboard-kedai/order/" + orderData.id}
                >
                  Lihat Detail Lengkap
                </NavButton> */}

                {orderData.payment_proof_url &&
                  orderData.status === "WAITING_SHOP_CONFIRMATION" && (
                    <div className="grid grid-cols-2 gap-4">
                      <ConfirmPaymentDialog order_id={orderData.id} />

                      <RejectPaymentDialog order_id={orderData.id} />
                    </div>
                  )}

                {/* <DialogClose asChild>
                  <Button size={"lg"} variant="outline">
                    Tutup
                  </Button>
                </DialogClose> */}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
