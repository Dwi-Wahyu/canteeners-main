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
  const canRequestRefund =
    !order.refund && order.status === "COMPLETED" && userRole === "CUSTOMER";

  const refundPath =
    userRole === "CUSTOMER"
      ? `/order/${order.id}/refund`
      : `/dashboard-kedai/order/${order.id}/refund`;

  // If no refund and can't request, don't show this section
  if (!order.refund && !canRequestRefund) {
    return null;
  }

  return (
    <div>
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-semibold">Refund</h1>
            <h1 className="text-muted-foreground mb-3">
              {order.refund
                ? "Kelola permintaan pengembalian dana"
                : "Ajukan permintaan pengembalian dana"}
            </h1>
          </div>
          {order.refund && (
            <RefundStatusBadge status={order.refund.status as any} />
          )}
        </div>
      </div>

      <div>
        <NavButton
          size="lg"
          variant="outline"
          className="w-full"
          href={refundPath}
        >
          {order.refund ? (
            <>
              <ExternalLink className="h-4 w-4" />
              Lihat Detail Refund
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4" />
              Ajukan Refund
            </>
          )}
        </NavButton>
      </div>
    </div>
  );
}
