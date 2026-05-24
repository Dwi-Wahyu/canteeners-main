"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefundStatusBadge } from "@/features/shop/refund/ui/refund-status-badge";
import { RespondRefundDialog } from "@/features/shop/refund/ui/respond-refund-dialog";
import { ProcessRefundDialog } from "@/features/shop/refund/ui/process-refund-dialog";
import {
  cancelRefund,
  completeRefund,
} from "@/features/shop/refund/lib/refund-actions";
import {
  refundReasonMapping,
  refundDisbursementModeMapping,
} from "@/constant/refund-mapping";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";
import { getImageUrl } from "@/helper/get-image-url";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from "radix-ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useWatchRefundUpdate } from "@/hooks/use-watch-refund-update";
import { GetRefundById } from "../types/refund-queries-types";
import Link from "next/link";

interface RefundDetailsProps {
  refund: GetRefundById;
  userRole: "CUSTOMER" | "SHOP_OWNER";
}

export function RefundDetails({
  refund: initialRefund,
  userRole,
}: RefundDetailsProps) {
  const { refundData } = useWatchRefundUpdate(initialRefund.id, initialRefund);
  const refund = refundData || initialRefund;

  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [isOpenProof, setIsOpenProof] = useState(false);

  const historyArray = refund.history || [];

  // Deteksi intervensi admin dengan lebih kuat (cek role OR nama aktor)
  const isAdminAction = (h: any) => {
    const role = String(h.actor_role || "").toUpperCase();
    const name = String(h.actor_name || "").toLowerCase();
    return role === "ADMIN" || name.includes("admin");
  };

  const hasAdminIntervened = historyArray.some(isAdminAction);

  const lastHistoryEntry = historyArray.length > 0 ? historyArray[0] : null;
  const isLastActionByAdmin =
    lastHistoryEntry && isAdminAction(lastHistoryEntry);

  // Status REJECTED menjadi final HANYA JIKA dilakukan oleh admin.
  // Jika dilakukan oleh kedai, customer masih boleh eskalasi.
  const isFinalStatus =
    ["ESCALATED", "CANCELLED", "PROCESSED", "COMPLETED"].includes(
      refund.status,
    ) ||
    (refund.status === "REJECTED" && hasAdminIntervened);

  const canCancel =
    !hasAdminIntervened &&
    !isLastActionByAdmin &&
    refund.status === "PENDING" &&
    userRole === "CUSTOMER";

  const canRespond =
    !hasAdminIntervened &&
    !isLastActionByAdmin &&
    refund.status === "PENDING" &&
    userRole === "SHOP_OWNER";

  const canProcess = refund.status === "APPROVED" && userRole === "SHOP_OWNER";

  const canComplete = refund.status === "PROCESSED" && userRole === "CUSTOMER";

  // Eskalasi benar-benar ditutup jika ada jejak admin atau status sudah final
  const canEscalate =
    !isFinalStatus && !hasAdminIntervened && !isLastActionByAdmin;

  // Extract affected item IDs from refund data
  const affectedItemIds =
    refund.affected_items?.map((item) => item.order_item_id) || [];

  const affectedItems =
    affectedItemIds.length > 0
      ? refund.order.order_items?.filter((item) =>
          affectedItemIds.includes(item.id),
        )
      : [];

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelRefund({ refund_id: refund.id });

      if (result.success) {
        toast.success("Refund berhasil dibatalkan");
      } else {
        toast.error(result.error.message || "Gagal membatalkan refund");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const result = await completeRefund({ refund_id: refund.id });

      if (result.success) {
        toast.success("Refund berhasil diselesaikan");
      } else {
        toast.error(result.error.message || "Gagal menyelesaikan refund");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Admin Intervention Lock Alert */}
      {hasAdminIntervened && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 text-xs font-medium">
            Keputusan refund ini telah diambil oleh Admin. Status tidak dapat
            diubah lagi oleh Kedai atau Customer.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label className="mb-2">Status</Label>

        {/* Header with Status */}
        <div className="flex items-center justify-between">
          <RefundStatusBadge status={refund.status} />
        </div>
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
          <p className="text-sm text-muted-foreground">Metode Pengembalian</p>
          <p className="font-medium">
            {
              refundDisbursementModeMapping[
                refund.disbursement_mode as keyof typeof refundDisbursementModeMapping
              ]
            }
          </p>
        </div>
      </div>

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
            <p className="text-sm font-medium">{refund.description}</p>
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

          <div className="relative w-full h-fit max-w-50 overflow-hidden rounded-lg border shadow-sm group">
            <img
              src={getImageUrl(
                "/complaint-proof/" + refund.complaint_proof_url,
              )}
              alt="Bukti Komplain"
              className="object-cover cursor-pointer transition-transform group-hover:scale-105"
              onClick={() => setIsOpenProof(true)}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 italic">
            *Klik gambar untuk memperbesar
          </p>

          <Dialog open={isOpenProof} onOpenChange={setIsOpenProof}>
            <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-visible border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/20 [&>button]:rounded-full [&>button]:p-2 [&>button]:top-[-40px] [&>button]:right-0 sm:[&>button]:right-[-40px] sm:[&>button]:top-0">
              <VisuallyHidden.Root>
                <DialogTitle>Bukti Refund</DialogTitle>
              </VisuallyHidden.Root>
              <div className="relative w-full h-full max-h-[85vh] flex items-center justify-center">
                <img
                  src={getImageUrl(
                    "/complaint-proof/" + refund.complaint_proof_url,
                  )}
                  alt="Bukti komplain"
                  className="max-w-full max-h-[85vh] object-contain rounded-md"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {refund.disbursement_proof_url && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Bukti Transfer</p>
          <div className="relative max-w-50 h-fit rounded-lg cursor-pointer overflow-hidden border">
            <img
              src={getImageUrl(
                "/disbursement-proof/" + refund.disbursement_proof_url,
              )}
              alt="Bukti transfer"
              onClick={() => setIsOpenProof(true)}
              className="object-contain"
            />
          </div>

          <p className="text-[10px] text-muted-foreground mt-1 italic">
            *Klik gambar untuk memperbesar
          </p>

          <Dialog open={isOpenProof} onOpenChange={setIsOpenProof}>
            <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-visible border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/20 [&>button]:rounded-full [&>button]:p-2 [&>button]:top-[-40px] [&>button]:right-0 sm:[&>button]:right-[-40px] sm:[&>button]:top-0">
              <VisuallyHidden.Root>
                <DialogTitle>Bukti Transfer</DialogTitle>
              </VisuallyHidden.Root>
              <div className="relative w-full h-full max-h-[85vh] flex items-center justify-center">
                <img
                  src={getImageUrl(
                    "/disbursement-proof/" + refund.disbursement_proof_url,
                  )}
                  alt="Bukti Pembayaran Full"
                  className="max-w-full max-h-[85vh] object-contain rounded-md"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Rejected Reason */}
      {refund.status === "REJECTED" && refund.rejected_reason && (
        <Alert variant="destructive">
          <X />
          <AlertDescription>
            <p className="font-medium mb-1">Alasan Penolakan:</p>
            <p className="text-sm">{refund.rejected_reason}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Escalated Reason */}
      {refund.status === "ESCALATED" && refund.escalated_reason && (
        <Alert>
          <AlertTriangle />
          <AlertDescription>
            <p className="font-medium mb-1">Alasan Eskalasi ke Admin:</p>
            <p className="text-sm">{refund.escalated_reason}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Cash Refund Alert for Customer */}
      {userRole === "CUSTOMER" &&
        refund.status === "APPROVED" &&
        refund.disbursement_mode === "CASH" && (
          <Alert>
            <CheckCircle2 />
            <AlertDescription>
              <span className="font-semibold">Refund Disetujui!</span> Silakan
              ambil dana refund Anda secara tunai di kedai.
            </AlertDescription>
          </Alert>
        )}

      {/* Processed Success */}
      {refund.status === "COMPLETED" && (
        <Alert>
          <CheckCircle2 />
          <AlertDescription>
            Dana refund telah dikembalikan ke customer.
          </AlertDescription>
        </Alert>
      )}

      {/* History Timeline */}
      {refund.history && refund.history.length > 0 && (
        <div className="space-y-4 pt-2">
          <Label>Riwayat Perubahan</Label>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.75 before:-translate-x-px before:h-full before:w-0.5 before:bg-muted">
            {refund.history.map((item, idx) => (
              <div key={item.id} className="relative flex items-start gap-4">
                <div
                  className={`mt-1.5 size-5.5 rounded-full border-4 border-background shadow-sm z-10 ${
                    idx === 0 ? "bg-primary" : "bg-muted"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-bold ${
                          idx === 0 ? "text-primary" : "text-foreground"
                        }`}
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
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      {item.note}
                    </p>
                  )}
                  <time className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {format(new Date(item.created_at), "dd MMM yyyy, HH:mm", {
                      locale: localeId,
                    })}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Customer Actions */}
        {canCancel && (
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? <Loader2 className="animate-spin" /> : <X />}
            Batalkan Refund
          </Button>
        )}

        {canComplete && (
          <Button
            variant="default"
            onClick={handleComplete}
            disabled={isCompleting}
            className="w-full sm:w-auto"
          >
            {isCompleting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CheckCircle2 />
            )}
            Konfirmasi Dana Diterima
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
            <CheckCircle2 />
            Proses Refund
          </Button>
        )}

        {/* Escalate (Both) */}
        {canEscalate && (
          <Button variant="destructive" asChild>
            <Link
              href={
                userRole === "CUSTOMER"
                  ? `/order/${refund.order_id}/refund/eskalasi`
                  : `/dashboard-kedai/order/${refund.order_id}/refund/eskalasi`
              }
            >
              Eskalasi ke Admin
            </Link>
          </Button>
        )}
      </div>

      {/* Dialogs */}
      <RespondRefundDialog
        open={respondDialogOpen}
        onOpenChange={setRespondDialogOpen}
        refund={refund}
      />

      <ProcessRefundDialog
        open={processDialogOpen}
        onOpenChange={setProcessDialogOpen}
        refund={refund}
      />
    </div>
  );
}
