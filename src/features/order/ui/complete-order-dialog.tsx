"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { completeOrder, confirmOrder } from "../lib/order-actions";
import { notificationDialog } from "@/hooks/use-notification-dialog";

export default function CompleteOrderDialog({
  order_id,
}: {
  order_id: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    startTransition(async () => {
      const result = await completeOrder({
        order_id,
      });

      if (result.success) {
        notificationDialog.success({
          title: "Order Telah Selesai !",
          message: "Terima kasih sudah bekerja sama dengan canteeners 😊🙏",
        });
      } else {
        notificationDialog.error({
          title: "Gagal Mengubah Status",
          message: "Silakan hubungi CS",
        });
      }

      setIsOpen(false);
    });
  }

  return (
    <div>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button size={"lg"} className="w-full">
            <CheckCircle />
            Pesanan Selesai
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">
              Tandai Pesanan Selesai ?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-start">
              Pastikan pelanggan sudah menerima pesanan
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end">
            <Button
              size={"lg"}
              onClick={() => setIsOpen(false)}
              variant={"outline"}
            >
              Batal
            </Button>
            <Button size={"lg"} onClick={handleClick} disabled={isPending}>
              Ya, Sudah Selesai
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
