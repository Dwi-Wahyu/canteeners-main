"use client";

import CustomBadge from "@/components/custom-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orderStatusMapping } from "@/constant/order-status-mapping";
import { paymentMethodMapping } from "@/constant/payment-method";
import { getOrderSummaryForChatBubble } from "@/features/order/lib/order-queries";
import ConfirmOrderDialog from "@/features/order/ui/confirm-order-dialog";
import { OrderStatus } from "@/generated/prisma";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  FileText,
  MapPin,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ShopOrderChatBubble({
  order_id,
}: {
  order_id: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["chat-bubble-order-summary", order_id],
    queryFn: () => getOrderSummaryForChatBubble(order_id),
  });

  return (
    <div className={`flex flex-col items-start`}>
      {isLoading && (
        <div
          className={`h-36 px-4 py-3 shadow rounded-xl bg-secondary animate-pulse w-[80%]`}
        ></div>
      )}

      {!isLoading && data && (
        <div
          className={`px-4 py-3 shadow rounded-xl w-[80%] bg-card border border-primary`}
        >
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
            <div className="mt-1">
              {data.order_items.map((items, idx) => (
                <div
                  key={`${order_id}-${idx}`}
                  className="flex items-center gap-3"
                >
                  <Image
                    src={getImageUrl(items.product.image_url)}
                    width={20}
                    height={20}
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
              <Separator />
              <div className="my-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Meja: {data.customer.table_number} Lantai: {data.customer.floor}
              </div>
              <Separator />
            </div>

            <div>
              <div className="flex justify-between">
                <h1 className="">Total</h1>

                <h1 className="text-primary">{data.total_price}</h1>
              </div>

              <h1>Pembayaran: {paymentMethodMapping[data.payment_method]}</h1>
            </div>

            <div className="p-2 my-4 bg-secondary items-center border border-accent-foreground rounded flex justify-between text-accent-foreground">
              <div className="flex gap-2">
                <FileText className="w-5 h-5" />

                <h1>Lihat Detail Pesanan</h1>
              </div>

              <ChevronRight className="w-5 h-5" />
            </div>

            <div className="flex flex-col gap-2">
              <ConfirmOrderDialog
                conversation_id={data.conversation_id}
                order_id={data.id}
                owner_id={data.shop.owner_id}
                payment_method={data.payment_method}
                shop_id={data.shop.id}
              />
              <Button variant={"outline"}>Tolak Pesanan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
