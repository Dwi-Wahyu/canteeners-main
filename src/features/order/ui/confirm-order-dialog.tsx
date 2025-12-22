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
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Loader } from "lucide-react";
import { useState } from "react";
import { confirmOrder } from "../lib/order-actions";

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

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async () => {
      return await confirmOrder({
        order_id,
        payment_method,
        shop_id,
      });
    },
  });

  async function handleConfirm() {
    const result = await mutateAsync();

    if (result.success) {
      setOpen(false);
    } else {
      console.log(result.error);
    }
  }

  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button size={"lg"} className="w-full">
            <CheckCircle />
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
          <AlertDialogFooter className="flex-row justify-end">
            <AlertDialogCancel asChild>
              <Button size={"lg"} variant={"outline"}>
                Batal
              </Button>
            </AlertDialogCancel>
            <Button size={"lg"} onClick={handleConfirm} disabled={isPending}>
              {isPending ? <Loader className="animate-spin" /> : "Terima"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
