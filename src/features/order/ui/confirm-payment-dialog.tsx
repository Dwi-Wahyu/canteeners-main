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
import { Check } from "lucide-react";
import { confirmPayment } from "../lib/order-actions";

export default function ConfirmPaymentDialog({
  order_id,
}: {
  order_id: string;
}) {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async () => {
      return await confirmPayment({
        order_id,
      });
    },
  });
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    const result = await mutateAsync();
    if (result.success) {
      notificationDialog.success({
        title: "Berhasil Konfirmasi Pembayaran",
        message: "Silakan mulai menyiapkan pesanan ini.",
        actionButtons: (
          <Button size={"lg"} onClick={notificationDialog.hide}>
            Tutup
          </Button>
        ),
      });
    } else {
      notificationDialog.error({
        title: "Gagal Konfirmasi Pembayaran",
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
        <Button className="w-full" size={"lg"} disabled={false}>
          <Check />
          Konfirmasi
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-start">
            Konfirmasi Pembayaran
          </AlertDialogTitle>
          <AlertDialogDescription className="text-start">
            Pastikan anda mulai menyiapkan pesanan ini.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end">
          <AlertDialogCancel asChild>
            <Button variant={"outline"} size={"lg"}>
              Batal
            </Button>
          </AlertDialogCancel>
          <Button size={"lg"} onClick={handleConfirm} disabled={isPending}>
            Konfirmasi Pembayaran
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
