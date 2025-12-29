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
import { PaymentMethod } from "@/generated/prisma";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { confirmOrder } from "../lib/order-actions";
import { notificationDialog } from "@/hooks/use-notification-dialog";

export default function ConfirmOrderDialog({
  order_id,
  payment_method,
  shop_id,
}: {
  order_id: string;
  payment_method: PaymentMethod;
  shop_id: string;
}) {
  const [open, setOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  async function handleConfirm() {
    startTransition(async () => {
      const result = await confirmOrder({
        order_id,
        payment_method,
        shop_id,
      });

      if (result.success) {
        setOpen(false);
        notificationDialog.success({
          title: "Berhasil",
          message: "Pesanan berhasil diterima",
        });
      } else {
        // Handle error dengan UI yang lebih baik daripada console.log
        notificationDialog.error({
          title: "Gagal Menerima Pesanan",
          message: result.error?.message || "Terjadi kesalahan sistem",
        });
      }
    });
  }

  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button size={"lg"} className="w-full" disabled={isPending}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Terima Pesanan
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">
              Terima Pesanan Ini?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-start">
              Pastikan stok pesanan tersedia, customer akan diberi tahu
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-2">
            <AlertDialogCancel asChild>
              <Button size={"lg"} variant={"outline"} disabled={isPending}>
                Batal
              </Button>
            </AlertDialogCancel>
            <Button size={"lg"} onClick={handleConfirm} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Terima"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
