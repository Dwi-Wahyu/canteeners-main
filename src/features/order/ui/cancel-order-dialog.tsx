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
            "Pesanan ini sudah dibayar. Jika dibatalkan, Anda wajib melakukan proses pengembalian dana kepada pelanggan. Minta nomor rekening pelanggan melalui chat jika memilih metode transfer.",
          action: "Ya, Batalkan & Refund",
          placeholder:
            "Contoh: Stok bahan makanan habis, kedai terlalu ramai, dll...",
        };
      }
      return {
        trigger: "Batalkan Pesanan",
        title: "Batalkan Pesanan Pelanggan?",
        description:
          "Silakan masukkan alasan pembatalan agar pelanggan mengetahui mengapa pesanan mereka dibatalkan.",
        action: "Ya, Batalkan Pesanan",
        placeholder:
          "Contoh: Kedai akan segera tutup, menu tidak tersedia, dll...",
      };
    }

    // Customer Labels
    if (isProcessing) {
      return {
        trigger: "Batalkan & Refund",
        title: "Batalkan Pesanan Anda?",
        description:
          "Sebagai Pelanggan, pesanan Anda sudah melewati estimasi waktu persiapan kedai. Anda berhak membatalkan pesanan ini dan mengajukan pengembalian dana (refund).",
        action: "Ya, Batalkan & Refund",
        placeholder:
          "Contoh: Waktu persiapan makanan terlalu lama, salah memilih menu, dll...",
      };
    }

    // Status-specific customer labels when not processing
    let description =
      "Sebagai Pelanggan, pesanan yang dibatalkan tidak dapat dikembalikan atau dilanjutkan kembali.";
    if (order_status === "PENDING_CONFIRMATION") {
      description =
        "Sebagai Pelanggan, Anda membatalkan pesanan dalam masa tenggang 15 detik. Pesanan akan segera dibatalkan secara otomatis.";
    } else if (
      order_status === "WAITING_PAYMENT" ||
      order_status === "PAYMENT_REJECTED"
    ) {
      description =
        "Sebagai Pelanggan, Anda membatalkan pesanan yang belum dibayar. Pembatalan ini akan membatalkan seluruh transaksi.";
    } else if (order_status === "WAITING_SHOP_CONFIRMATION") {
      description =
        "Sebagai Pelanggan, Anda membatalkan pesanan yang sedang menunggu konfirmasi kedai.";
    }

    return {
      trigger: "Batalkan Pesanan",
      title: "Yakin ingin membatalkan pesanan?",
      description,
      action: "Ya, Batalkan Pesanan",
      placeholder:
        "Contoh: Salah memesan menu, ingin mengubah metode pembayaran, dll...",
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
      <AlertDialogContent>
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>{labels.title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {labels.description}
          </AlertDialogDescription>

          <div className="space-y-1.5 mt-4">
            <Label>
              Alasan Pembatalan<span className="text-red-500">*</span>
            </Label>
            <Textarea
              disabled={isPending}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={labels.placeholder}
              className="h-28"
            />
          </div>

          {isOwner && isProcessing && (
            <div className="space-y-3 mt-4">
              <Label className=" ml-1">
                Metode Pengembalian Dana<span className="text-red-500">*</span>
              </Label>
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
                    className="flex gap-2 items-center rounded-xl border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Banknote className=" h-6 w-6" />
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
                    className="flex gap-2 items-center rounded-xl border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <CreditCard className=" h-6 w-6" />
                    <span className="text-xs font-bold">Transfer</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {isProcessing && (
            <Link
              className="underline text-sm text-muted-foreground underline-offset-2 w-fit mt-2"
              href={"/syarat-dan-ketentuan/refund"}
            >
              Lihat Syarat & Ketentuan Refund
            </Link>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant={"outline"} disabled={isPending}>
              Tutup
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
