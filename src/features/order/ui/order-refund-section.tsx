"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefundStatusBadge } from "@/features/shop/refund/ui/refund-status-badge";
import { DollarSign, ExternalLink } from "lucide-react";
import Link from "next/link";
import NavButton from "@/components/nav-button";

interface OrderRefundSectionProps {
  order: {
    id: string;
    status: string;
    refund?: {
      id: string;
      status: string;
    };
  };
  userRole: "CUSTOMER" | "SHOP_OWNER";
}

export function OrderRefundSection({
  order,
  userRole,
}: OrderRefundSectionProps) {
  const isCancelled = order.status === "CANCELLED";
  const canRequestRefund =
    !order.refund && order.status === "COMPLETED" && userRole === "CUSTOMER";

  const refundPath =
    userRole === "CUSTOMER"
      ? `/order/${order.id}/refund`
      : `/dashboard-kedai/order/${order.id}/refund`;

  // Tampilkan jika sudah ada data refund, atau jika bisa mengajukan (COMPLETED), 
  // atau jika pesanan dibatalkan (biasanya ada auto-refund)
  if (!order.refund && !canRequestRefund && !isCancelled) {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="size-4 text-green-600" />
              Informasi Refund
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {order.refund
                ? "Dana Anda sedang diproses. Silakan cek detail untuk status terbaru."
                : isCancelled 
                  ? "Pesanan dibatalkan. Dana Anda akan segera dikembalikan secara otomatis."
                  : "Klik tombol di bawah jika Anda ingin mengajukan pengembalian dana."}
            </p>
          </div>
          {order.refund && (
            <RefundStatusBadge status={order.refund.status as any} />
          )}
        </div>

        <NavButton
          size="lg"
          variant={order.refund ? "outline" : "default"}
          className="w-full font-bold h-12 rounded-xl"
          href={refundPath}
        >
          {order.refund ? (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Lihat Status Refund
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Ajukan Refund
            </>
          )}
        </NavButton>
      </CardContent>
    </Card>
  );
}
