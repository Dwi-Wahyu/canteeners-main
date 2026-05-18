"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { OrderStatus, RefundDisbursementMode } from "@/generated/prisma";
import { Textarea } from "@/components/ui/textarea";

import Link from "next/link";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import {
  Loader,
  AlertTriangle,
  XCircle,
  Banknote,
  CreditCard,
} from "lucide-react";
import { cancelOrder } from "../lib/order-actions";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function CancelOrderDialog({
  order_id,
  user_id,
  order_status,
  userRole = "CUSTOMER",
  isLate = false,
  className,
  defaultDisbursementMode = "CASH",
}: {
  order_id: string;
  user_id: string;
  order_status: OrderStatus;
  userRole?: "CUSTOMER" | "SHOP_OWNER";
  isLate?: boolean;
  className?: string;
  defaultDisbursementMode?: RefundDisbursementMode;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [disbursementMode, setDisbursementMode] =
    useState<RefundDisbursementMode>(defaultDisbursementMode);
  const [isPending, startTransition] = useTransition();

  const isProcessing = order_status === "PROCESSING";
  const isOwner = userRole === "SHOP_OWNER";

  async function handleConfirm() {
    if (!reason.trim()) {
      return notificationDialog.error({
        title: "Alasan Wajib Diisi",
        message: "Silakan berikan alasan pembatalan pesanan.",
      });
    }

    startTransition(async () => {
      const result = await cancelOrder({
        order_id,
        cancelled_by_id: user_id,
        cancelled_reason: reason,
        order_status,
        disbursement_mode:
          isOwner && isProcessing ? disbursementMode : undefined,
      });

      if (result.success) {
        setOpen(false);
        notificationDialog.success({
          title: "Pesanan Dibatalkan",
          message: result.message,
          duration: 3000,
          showLoadingBar: true,
        });
      } else {
        notificationDialog.error({
          title: "Gagal Membatalkan",
          message: result.error.message,
        });
      }
    });
  }

  const getDialogLabels = () => {
    if (isOwner) {
      if (isProcessing) {
        return {
          trigger: "Batalkan & Refund",
          title: "Batalkan Pesanan & Kembalikan Dana?",
          description:
            "Pesanan ini sudah dibayar. Jika dibatalkan, Anda wajib mengembalikan dana kepada pelanggan.",
          action: "Ya, Batalkan & Refund",
        };
      }
      return {
        trigger: "Batalkan Pesanan",
        title: "Batalkan Pesanan Pelanggan?",
        description:
          "Berikan alasan yang jelas mengapa Anda perlu membatalkan pesanan ini.",
        action: "Batalkan Pesanan",
      };
    }

    // Customer Labels
    if (isProcessing) {
      return {
        trigger: "Batalkan & Refund",
        title: "Batalkan Pesanan Anda?",
        description:
          "Pesanan sudah melewati estimasi waktu. Anda dapat membatalkan pesanan dan dana akan dikembalikan.",
        action: "Ya, Batalkan Sekarang",
      };
    }
    return {
      trigger: "Batalkan Pesanan",
      title: "Yakin ingin membatalkan?",
      description:
        "Pesanan yang dibatalkan tidak dapat dikembalikan. Silakan masukkan alasan pembatalan.",
      action: "Ya, Batalkan",
    };
  };

  const labels = getDialogLabels();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size={"lg"}
          variant={"destructive"}
          className={cn(className)}
          disabled={isPending}
        >
          {/* {isProcessing ? <AlertTriangle size={18} /> : <XCircle size={18} />} */}
          {labels.trigger}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[90vw] rounded-2xl overflow-y-auto max-h-[90vh]">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={20} />
            {labels.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {labels.description}
          </AlertDialogDescription>

          <div className="space-y-1.5 mt-4">
            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
              Alasan Pembatalan
            </label>
            <Textarea
              disabled={isPending}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Stok habis, Terlalu lama, dll..."
              className="h-28 rounded-xl bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-destructive"
            />
          </div>

          {isOwner && isProcessing && (
            <div className="space-y-3 mt-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                Metode Pengembalian Dana
              </label>
              <RadioGroup
                disabled={isPending}
                value={disbursementMode}
                onValueChange={(v) =>
                  setDisbursementMode(v as RefundDisbursementMode)
                }
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <RadioGroupItem
                    value="CASH"
                    id="cash"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="cash"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Banknote className="mb-2 h-6 w-6" />
                    <span className="text-xs font-bold">Tunai</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="TRANSFER"
                    id="transfer"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="transfer"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <CreditCard className="mb-2 h-6 w-6" />
                    <span className="text-xs font-bold">Transfer</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {isProcessing && (
            <div className="mt-4 bg-blue-50 p-3 rounded-xl">
              <Link
                className="text-[11px] text-blue-600 font-medium flex items-center gap-1"
                href={"/syarat-dan-ketentuan"}
              >
                Lihat Syarat & Ketentuan Refund
              </Link>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex sm:flex-row gap-3 mt-6">
          <AlertDialogCancel asChild>
            <Button variant={"outline"} disabled={isPending}>
              Kembali
            </Button>
          </AlertDialogCancel>
          <Button
            variant={"destructive"}
            onClick={handleConfirm}
            disabled={isPending || !reason.trim()}
          >
            {isPending ? (
              <Loader className="animate-spin mr-2" />
            ) : (
              labels.action
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
