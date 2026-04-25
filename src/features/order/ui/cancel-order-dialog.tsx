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
import { OrderStatus } from "@/generated/prisma";
import { Textarea } from "@/components/ui/textarea";

import Link from "next/link";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { Loader, AlertTriangle, XCircle } from "lucide-react";
import { cancelOrder } from "../lib/order-actions";
import { cn } from "@/lib/utils";

export default function CancelOrderDialog({
  order_id,
  user_id,
  order_status,
  userRole = "CUSTOMER",
  isLate = false,
  className,
}: {
  order_id: string;
  user_id: string;
  order_status: OrderStatus;
  userRole?: "CUSTOMER" | "SHOP_OWNER";
  isLate?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
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
          description: "Pesanan ini sudah dibayar. Jika dibatalkan, Anda wajib mengembalikan dana kepada pelanggan secara manual atau melalui sistem refund yang tersedia.",
          action: "Ya, Batalkan & Refund",
        };
      }
      return {
        trigger: "Batalkan Pesanan",
        title: "Batalkan Pesanan Pelanggan?",
        description: "Berikan alasan yang jelas mengapa Anda perlu membatalkan pesanan ini.",
        action: "Batalkan Pesanan",
      };
    }

    // Customer Labels
    if (isProcessing) {
      return {
        trigger: "Batalkan & Refund",
        title: "Batalkan Pesanan Anda?",
        description: "Pesanan sudah melewati estimasi waktu. Anda dapat membatalkan pesanan dan dana akan dikembalikan.",
        action: "Ya, Batalkan Sekarang",
      };
    }
    return {
      trigger: "Batalkan Pesanan",
      title: "Yakin ingin membatalkan?",
      description: "Pesanan yang dibatalkan tidak dapat dikembalikan. Silakan masukkan alasan pembatalan.",
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
          className={cn("w-full font-bold gap-2", className)}
          disabled={isPending}
        >
          {isProcessing ? <AlertTriangle size={18} /> : <XCircle size={18} />}
          {labels.trigger}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[90vw] rounded-2xl">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={20} />
            {labels.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {labels.description}
          </AlertDialogDescription>

          <div className="space-y-1.5 mt-4">
            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Alasan Pembatalan</label>
            <Textarea
              disabled={isPending}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Stok habis, Terlalu lama, dll..."
              className="h-32 rounded-xl bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-destructive"
            />
          </div>

          {isProcessing && (
            <div className="mt-2 bg-blue-50 p-3 rounded-xl">
              <Link
                className="text-[11px] text-blue-600 font-medium flex items-center gap-1"
                href={"/syarat-dan-ketentuan"}
              >
                Lihat Syarat & Ketentuan Refund
              </Link>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
          <AlertDialogCancel asChild>
            <Button variant={"outline"} className="w-full h-12 rounded-xl font-bold" disabled={isPending}>
              Kembali
            </Button>
          </AlertDialogCancel>
          <Button
            variant={"destructive"}
            className="w-full h-12 rounded-xl font-bold"
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
