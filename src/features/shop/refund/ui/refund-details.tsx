"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefundStatusBadge } from "@/features/shop/refund/ui/refund-status-badge";
import { RespondRefundDialog } from "@/features/shop/refund/ui/respond-refund-dialog";
import { ProcessRefundDialog } from "@/features/shop/refund/ui/process-refund-dialog";
import { EscalateRefundDialog } from "@/features/shop/refund/ui/escalate-refund-dialog";
import { cancelRefund } from "@/features/shop/refund/lib/refund-actions";
import {
  refundReasonMapping,
  refundDisbursementModeMapping,
} from "@/constant/refund-mapping";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RefundDetailsProps {
  refund: {
    id: string;
    amount: number;
    reason: string;
    status: string;
    description: string | null;
    complaint_proof_url: string | null;
    disbursement_proof_url: string | null;
    disbursement_mode: string;
    rejected_reason: string | null;
    escalated_reason: string | null;
    requested_at: Date;
    processed_at: Date | null;
    affected_items?: Array<{
      order_item_id: string;
    }>;
    order: {
      id: string;
      order_items?: Array<{
        id: string;
        product: {
          name: string;
        };
        quantity: number;
        subtotal: number;
      }>;
    };
  };
  userRole: "CUSTOMER" | "SHOP_OWNER";
  onRefresh?: () => void;
}

export function RefundDetails({
  refund,
  userRole,
  onRefresh,
}: RefundDetailsProps) {
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const canCancel = refund.status === "PENDING" && userRole === "CUSTOMER";
  const canRespond = refund.status === "PENDING" && userRole === "SHOP_OWNER";
  const canProcess = refund.status === "APPROVED" && userRole === "SHOP_OWNER";
  const canEscalate = !["ESCALATED", "CANCELLED", "PROCESSED"].includes(
    refund.status
  );

  // Extract affected item IDs from refund data
  const affectedItemIds =
    refund.affected_items?.map((item) => item.order_item_id) || [];

  const affectedItems =
    affectedItemIds.length > 0
      ? refund.order.order_items?.filter((item) =>
          affectedItemIds.includes(item.id)
        )
      : [];

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelRefund({ refund_id: refund.id });

      if (result.success) {
        toast.success("Refund berhasil dibatalkan");
        onRefresh?.();
      } else {
        toast.error(result.error.message || "Gagal membatalkan refund");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <RefundStatusBadge status={refund.status as any} />
      </div>

      {/* Amount & Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Jumlah Refund</p>
          <p className="text-2xl font-bold">
            Rp{refund.amount.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Mode Pengembalian</p>
          <p className="font-medium">
            {
              refundDisbursementModeMapping[
                refund.disbursement_mode as keyof typeof refundDisbursementModeMapping
              ]
            }
          </p>
        </div>
      </div>

      <Separator />

      {/* Reason & Description */}
      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Alasan</p>
          <p className="font-medium">
            {
              refundReasonMapping[
                refund.reason as keyof typeof refundReasonMapping
              ]
            }
          </p>
        </div>

        {refund.description && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Deskripsi</p>
            <p className="text-sm bg-muted p-3 rounded-lg">
              {refund.description}
            </p>
          </div>
        )}
      </div>

      {/* Affected Items */}
      {affectedItems && affectedItems.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Item yang Bermasalah
          </p>
          <div className="border rounded-lg divide-y">
            {affectedItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3"
              >
                <div>
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity}x
                  </p>
                </div>
                <span className="text-sm font-medium">
                  Rp{item.subtotal.toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof Images */}
      {refund.complaint_proof_url && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Bukti Komplain</p>
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <Image
              src={refund.complaint_proof_url}
              alt="Bukti komplain"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {refund.disbursement_proof_url && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Bukti Transfer</p>
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <Image
              src={refund.disbursement_proof_url}
              alt="Bukti transfer"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Rejected Reason */}
      {refund.status === "REJECTED" && refund.rejected_reason && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Alasan Penolakan:</p>
            <p className="text-sm">{refund.rejected_reason}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Escalated Reason */}
      {refund.status === "ESCALATED" && refund.escalated_reason && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Alasan Eskalasi ke Admin:</p>
            <p className="text-sm">{refund.escalated_reason}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Processed Success */}
      {refund.status === "PROCESSED" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            Dana refund telah dikembalikan ke customer.
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Customer Actions */}
        {canCancel && (
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling && <Loader2 className="h-4 w-4 animate-spin" />}
            <X className="h-4 w-4" />
            Batalkan Refund
          </Button>
        )}

        {/* Shop Owner Actions */}
        {canRespond && (
          <Button variant="default" onClick={() => setRespondDialogOpen(true)}>
            Tanggapi Refund
          </Button>
        )}

        {canProcess && (
          <Button
            variant="default"
            onClick={() => setProcessDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Tandai Selesai
          </Button>
        )}

        {/* Escalate (Both) */}
        {canEscalate && (
          <Button
            variant="destructive"
            onClick={() => setEscalateDialogOpen(true)}
          >
            <AlertTriangle className="h-4 w-4" />
            Eskalasi ke Admin
          </Button>
        )}
      </div>

      {/* Dialogs */}
      <RespondRefundDialog
        open={respondDialogOpen}
        onOpenChange={setRespondDialogOpen}
        refund={refund as any}
        onSuccess={onRefresh}
      />

      <ProcessRefundDialog
        open={processDialogOpen}
        onOpenChange={setProcessDialogOpen}
        refund={refund as any}
        onSuccess={onRefresh}
      />

      <EscalateRefundDialog
        open={escalateDialogOpen}
        onOpenChange={setEscalateDialogOpen}
        refundId={refund.id}
        onSuccess={onRefresh}
      />
    </div>
  );
}
