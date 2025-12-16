"use client";

import { getOrderSummaryForChatBubble } from "@/features/order/lib/order-queries";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function OrderChatBubble({
  order_id,
  isSender,
  role,
}: {
  order_id: string;
  isSender: boolean;
  role: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["chat-bubble-order-summary", order_id],
    queryFn: () => getOrderSummaryForChatBubble(order_id),
  });

  const detaiUrl =
    role === "CUSTOMER"
      ? `/dashboard-pelanggan/order/${order_id}`
      : `/dashboard-kedai/order/${order_id}`;

  return (
    <div className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}>
      <h1 className="text-muted-foreground text-xs mb-1">
        Klik untuk lihat detail
      </h1>

      {isLoading && (
        <div
          className={`h-36 px-4 py-3 shadow rounded-xl ${
            isSender ? "bg-primary" : "bg-secondary"
          } animate-pulse w-[80%]`}
        ></div>
      )}

      {!isLoading && data && (
        <div
          className={`px-4 py-3 shadow rounded-xl w-[80%] ${
            isSender
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <Link href={detaiUrl} className="w-full flex flex-col gap-2">
            <h1 className="text-lg font-semibold">Order Baru</h1>

            <div>
              <h1 className="font-semibold">Pesanan</h1>
              <div className="mt-1">
                {data.order_items.map((items, idx) => (
                  <div key={`${order_id}-${idx}`} className="flex gap-1">
                    <h1 className="font-semibold">{items.quantity}x</h1>
                    <h1>{items.product.name}</h1>
                  </div>
                ))}
              </div>
            </div>

            <h1 className="">
              Total Harga{" "}
              <span className="font-semibold">{data.total_price}</span>
            </h1>

            <h1></h1>
          </Link>
        </div>
      )}
    </div>
  );
}
