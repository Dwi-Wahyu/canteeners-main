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
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { Textarea } from "@/components/ui/textarea";
import { rejectPayment } from "../lib/order-actions";
import { X } from "lucide-react";

export default function RejectPaymentDialog({
  order_id,
}: {
  order_id: string;
}) {
  const [rejectPaymentReason, setRejectPaymentReason] = useState("");
  const [open, setOpen] = useState(false);

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async () => {
      return await rejectPayment({ order_id, reason: rejectPaymentReason });
    },
  });

  async function handleReject() {
    const result = await mutateAsync();

    if (result.success) {
      setOpen(false);
      notificationDialog.success({
        title: "Berhasil Menolak Pembayaran",
        message:
          "Pelanggan akan diminta untuk mengirimkan kembali bukti pembayaran",
        actionButtons: (
          <Button size={"lg"} onClick={notificationDialog.hide}>
            Tutup
          </Button>
        ),
      });
    } else {
      setOpen(false);
      notificationDialog.error({
        title: "Gagal Menolak Pembayaran",
        message: result.error.message || "Silakan coba lagi",
        actionButtons: (
          <Button size={"lg"} onClick={notificationDialog.hide}>
            Tutup
          </Button>
        ),
      });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full"
          variant={"destructive"}
          disabled={false}
          size={"lg"}
        >
          <X />
          Tolak
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Yakin Menolak Pembayaran Ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Pelanggan akan diminta untuk mengirimkan kembali bukti pembayaran
          </AlertDialogDescription>
          <Textarea
            value={rejectPaymentReason}
            onChange={(e) => setRejectPaymentReason(e.target.value)}
            placeholder="Alasan"
            className="mt-1"
            disabled={isPending}
          />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant={"outline"} size={"lg"}>
              Batal
            </Button>
          </AlertDialogCancel>
          <Button
            size={"lg"}
            variant={"destructive"}
            onClick={handleReject}
            disabled={isPending}
          >
            Tolak
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
