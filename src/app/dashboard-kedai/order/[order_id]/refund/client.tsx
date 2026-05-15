"use client";

import { GetShopOrderDetail } from "@/features/order/types/order-queries-types";
import { RefundDetails } from "@/features/shop/refund/ui/refund-details";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useWatchOrderUpdate } from "@/hooks/use-watch-order-update";
import { useWatchRefundUpdate } from "@/hooks/use-watch-refund-update";
import { useRouter } from "next/navigation";

interface ShopRefundPageClientProps {
  order: GetShopOrderDetail;
  orderId: string;
}

export function ShopRefundPageClient({
  order: initialOrder,
  orderId,
}: ShopRefundPageClientProps) {
  const router = useRouter();
  const { orderData } = useWatchOrderUpdate(orderId);
  const order = (orderData as unknown as GetShopOrderDetail) || initialOrder;

  // Aktifkan kembali listener khusus refund untuk realtime bus
  const refundId = order?.refund?.id;
  useWatchRefundUpdate(refundId, ["order-detail", orderId]);

  const refundData = order.refund;

  if (!refundData) {
    return (
      <div className="p-5 text-center">
        <p>Refund tidak ditemukan</p>
        <Link
          href={`/dashboard-kedai/order/${orderId}`}
          className="text-primary underline mt-2 inline-block"
        >
          Kembali ke Detail Order
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      <div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <Link
              href={`/dashboard-kedai/order/${orderId}`}
              className="flex gap-1 text-muted-foreground text-sm items-center"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali
            </Link>
          </div>

          <CardTitle>Detail Refund</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Kelola permintaan refund customer untuk pesanan ini
          </CardDescription>
        </div>

        <div className="mt-4">
          <RefundDetails
            refund={refundData as any}
            userRole="SHOP_OWNER"
            onRefresh={() => router.refresh()}
          />
        </div>
      </div>
    </div>
  );
}
