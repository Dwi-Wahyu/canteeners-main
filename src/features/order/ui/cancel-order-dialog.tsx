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
import { Loader } from "lucide-react";
import { cancelOrder } from "../lib/order-actions";

export default function CancelOrderDialog({
  order_id,
  user_id,
  order_status,
}: {
  order_id: string;
  user_id: string;
  order_status: OrderStatus;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const [isPending, startTransition] = useTransition();

  const CUSTOMER_ALREADY_PAY = order_status === "PROCESSING";

  async function handleConfirm() {
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
          title: "Aksi Berhasil",
          message: result.message,
        });
      } else {
        notificationDialog.error({
          title: "Terjadi Kesalahan",
          message: result.error.message,
        });
      }
    });
  }

  function CancelOrderDialogTitle() {
    if (CUSTOMER_ALREADY_PAY) {
      return "Peringatan!";
    }
    return "Yakin Membatalkan Order?";
  }

  function CancelOrderDialogDescription() {
    if (CUSTOMER_ALREADY_PAY) {
      return "Anda wajib untuk melakukan pengembalian dana. Berikan alasan pembatalan";
    }

    return "Berikan alasan pembatalan";
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size={"lg"} variant={"destructive"} className="w-full ">
          Batalkan Order
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>{CancelOrderDialogTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {CancelOrderDialogDescription()}
          </AlertDialogDescription>

          <Textarea
            disabled={isPending}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder=""
            className="h-40"
          />

          {CUSTOMER_ALREADY_PAY && (
            <div>
              <Link
                className="text-blue-500 underline underline-offset-2"
                href={"/syarat-dan-ketentuan"}
              >
                Baca syarat dan ketentuan
              </Link>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-2 gap-4">
          <AlertDialogCancel asChild>
            <Button size={"lg"} variant={"outline"} disabled={isPending}>
              Ga Jadi Deh
            </Button>
          </AlertDialogCancel>
          <Button
            size={"lg"}
            variant={"destructive"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? <Loader className="animate-spin" /> : "Yakin"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
