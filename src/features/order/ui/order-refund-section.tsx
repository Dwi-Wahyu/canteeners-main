"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RefundStatusBadge } from "@/features/shop/refund/ui/refund-status-badge";
import { DollarSign, ExternalLink } from "lucide-react";
import NavButton from "@/components/nav-button";

import { OrderStatus, RefundStatus } from "@/generated/prisma";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { completeRefund } from "@/features/shop/refund/lib/refund-actions";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface OrderRefundSectionProps {
  order: {
    id: string;
    status: OrderStatus;
    refund?: {
      id: string;
      status: RefundStatus;
      history?: {
        id: string;
        status: RefundStatus;
        note: string | null;
        actor_role?: string | null;
        actor_name?: string | null;
        created_at: Date;
      }[];
    } | null;
  };
  userRole: "CUSTOMER" | "SHOP_OWNER";
}

export function OrderRefundSection({
  order,
  userRole,
}: OrderRefundSectionProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const isCancelled = order.status === "CANCELLED";
  const canRequestRefund =
    !order.refund && order.status === "COMPLETED" && userRole === "CUSTOMER";

  const refundPath =
    userRole === "CUSTOMER"
      ? `/order/${order.id}/refund`
      : `/dashboard-kedai/order/${order.id}/refund`;

  const handleCompleteRefund = async () => {
    if (!order.refund) return;

    setIsCompleting(true);
    try {
      const result = await completeRefund({ refund_id: order.refund.id });
      if (result.success) {
        toast.success("Refund berhasil diselesaikan");
        // We might want to refresh the page or trigger a re-fetch
        window.location.reload();
      } else {
        toast.error(result.error.message || "Gagal menyelesaikan refund");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsCompleting(false);
    }
  };

  // Tampilkan jika sudah ada data refund, atau jika bisa mengajukan (COMPLETED),
  // atau jika pesanan dibatalkan (biasanya ada auto-refund)
  if (!order.refund && !canRequestRefund && !isCancelled) {
    return null;
  }

  // Jika tidak ada data refund dan user adalah pemilik kedai, sembunyikan section ini
  // karena pemilik kedai tidak dapat mengajukan refund sendiri
  if (!order.refund && userRole === "SHOP_OWNER") {
    return null;
  }

  const isProcessed = order.refund?.status === "PROCESSED";
  const isCustomer = userRole === "CUSTOMER";

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
                ? order.refund.status === "PROCESSED" && isCustomer
                  ? "Dana telah dikirim. Harap konfirmasi jika Anda sudah menerimanya."
                  : "Dana Anda sedang diproses. Silakan cek detail untuk status terbaru."
                : isCancelled
                  ? "Pesanan dibatalkan. Dana Anda akan segera dikembalikan secara otomatis."
                  : "Klik tombol di bawah jika Anda ingin mengajukan pengembalian dana."}
            </p>
          </div>
          {order.refund && <RefundStatusBadge status={order.refund.status} />}
        </div>

        {order.refund?.history && order.refund.history.length > 0 && (
          <div className="space-y-4 pt-2">
            <Label>Riwayat Perubahan</Label>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-muted">
              {order.refund.history.map((item, idx) => (
                <div key={item.id} className="relative flex items-start gap-4">
                  <div
                    className={`mt-1.5 size-[22px] rounded-full border-4 border-background shadow-sm z-10 ${
                      idx === 0 ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs font-bold ${idx === 0 ? "text-primary" : "text-foreground"}`}
                        >
                          {item.status.replace(/_/g, " ")}
                        </p>
                        {item.actor_role === "ADMIN" && (
                          <Badge
                            variant="secondary"
                            className="h-4 text-[8px] px-1 bg-blue-100 text-blue-700 border-blue-200"
                          >
                            ADMIN
                          </Badge>
                        )}
                      </div>
                      {item.actor_name && (
                        <p className="text-[10px] text-muted-foreground font-medium">
                          oleh {item.actor_name}
                        </p>
                      )}
                    </div>
                    {item.note && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 italic">
                        {item.note}
                      </p>
                    )}
                    <time className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {format(new Date(item.created_at), "dd MMM, HH:mm", {
                        locale: localeId,
                      })}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {isProcessed && isCustomer && (
            <Button
              className="w-full"
              variant="default"
              onClick={handleCompleteRefund}
              disabled={isCompleting}
            >
              {isCompleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Konfirmasi Dana Diterima
            </Button>
          )}

          <NavButton
            size="lg"
            variant={"outline"}
            className="w-full"
            href={refundPath}
          >
            {order.refund ? (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Lihat Status Refund
              </>
            ) : (
              <>Ajukan Refund</>
            )}
          </NavButton>
        </div>
      </CardContent>
    </Card>
  );
}
