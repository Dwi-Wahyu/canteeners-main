"use client";

import CustomBadge from "@/components/custom-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
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
  paymentMethodIconMapping,
  paymentMethodMapping,
} from "@/constant/payment-method";
import { OrderStatus } from "@/generated/prisma";
import { formatDateTimeIndonesian } from "@/helper/date-helper";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import { useWatchOrderUpdate } from "@/hooks/use-watch-order-update";
import {
  Calendar,
  FileText,
  HandPlatter,
  MapPin,
  StickyNote,
} from "lucide-react";
import Image from "next/image";
import ConfirmOrderDialog from "./confirm-order-dialog";
import RejectOrderDialog from "./reject-order-dialog";
import { postOrderTypeMapping } from "@/constant/post-order-type-mapping";
import RunIcon from "@/components/icons/run-icon";

export default function ShopOrderDetailDialog({
  order_id,
  trigger,
}: {
  order_id: string;
  trigger: React.ReactNode;
}) {
  const { orderData, loading, refetch } = useWatchOrderUpdate(order_id);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>{" "}
      <DialogContent className="p-0" showCloseButton={false}>
        <DialogHeader className="flex-row border-b p-4 justify-between items-center">
          <DialogTitle>Detail Pesanan</DialogTitle>
          <DialogDescription>
            {loading && <Badge variant={"outline"}>Loading . . .</Badge>}

            {!loading && orderData && (
              <CustomBadge
                value={orderData.status}
                outlineValues={[OrderStatus.PENDING_CONFIRMATION]}
              >
                {orderStatusMapping[orderData.status]}
              </CustomBadge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 pt-0">
          {loading && <div>Memuat...</div>}

          {!loading && orderData && (
            <div className="flex flex-col gap-4">
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
                            {orderItem.selected_options.map((options, idx) => (
                              <Badge variant={"outline"} key={idx}>
                                {options.value}
                              </Badge>
                            ))}
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

              <Separator />
              <div className="flex justify-between items-center">
                <h1 className="font-medium">Total Pembayaran</h1>

                <h1 className="text-lg text-primary">
                  {formatRupiah(orderData.total_price)}
                </h1>
              </div>
              <Separator />

              <div className="flex flex-col gap-2">
                <ConfirmOrderDialog
                  conversation_id={orderData.conversation_id}
                  order_id={orderData.id}
                  owner_id={orderData.shop.owner_id}
                  payment_method={orderData.payment_method}
                  shop_id={orderData.shop_id}
                />

                <RejectOrderDialog order_id={orderData.id} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
