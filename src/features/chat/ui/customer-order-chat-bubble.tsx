"use client";

import CustomBadge from "@/components/custom-badge";
import NavButton from "@/components/nav-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orderStatusMapping } from "@/constant/order-status-mapping";
import { paymentMethodMapping } from "@/constant/payment-method";
import { getOrderSummaryForChatBubble } from "@/features/order/lib/order-queries";
import { OrderStatus } from "@/generated/prisma";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, FileText, MapPin, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CustomerOrderChatBubble({
  order_id,
}: {
  order_id: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["chat-bubble-order-summary", order_id],
    queryFn: () => getOrderSummaryForChatBubble(order_id),
  });

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
                warningValues={[OrderStatus.WAITING_PAYMENT]}
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
                <Separator />
                <div className="my-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Meja: {data.customer.table_number} Lantai:{" "}
                  {data.customer.floor}
                </div>
                <Separator />
              </div>

              <div>
                <div className="flex justify-between">
                  <h1 className="">Total</h1>

                  <h1 className="font-semibold">{data.total_price}</h1>
                </div>

                <h1>Pembayaran: {paymentMethodMapping[data.payment_method]}</h1>
              </div>

              <Link
                href={"/order/" + data.id}
                className="p-2 my-4 bg-secondary items-center border cursor-pointer border-accent-foreground rounded flex justify-between text-accent-foreground hover:text-accent"
              >
                <div className="flex gap-2">
                  <FileText className="w-5 h-5" />

                  <h1>Lihat Detail Pesanan</h1>
                </div>

                <ChevronRight className="w-5 h-5" />
              </Link>

              {data.status === "COMPLETED" && (
                <div className="w-full">
                  <NavButton className="w-full" href={"/testimoni"}>
                    Beri Testimoni Untuk Canteeners
                  </NavButton>
                </div>
              )}

              {data.status === "WAITING_PAYMENT" && (
                <div className="w-full">
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
