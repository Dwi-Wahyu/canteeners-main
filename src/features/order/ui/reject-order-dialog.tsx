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
import { Textarea } from "@/components/ui/textarea";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { rejectOrder } from "../lib/order-actions";
import { Loader, XCircle } from "lucide-react";

export default function RejectOrderDialog({ order_id }: { order_id: string }) {
  const [open, setOpen] = useState(false);

  const [rejectedReason, setRejectedReason] = useState("");

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async () => {
      return await rejectOrder({
        order_id,
        rejected_reason: rejectedReason,
      });
    },
  });

  async function handleConfirm() {
    if (!rejectedReason.trim()) {
      return;
    }

    const result = await mutateAsync();

    if (result.success) {
      notificationDialog.success({
        title: "Berhasil menolak order",
        actionButtons: (
          <Button size={"lg"} variant={"outline"}>
            Hubungi Pelanggan
          </Button>
        ),
      });
    } else {
      notificationDialog.error({
        title: "Terjadi Kesalahan",
        message: "Silakan hubungi CS",
      });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size={"lg"}
          variant={"outline"}
          className="w-full text-destructive"
        >
          <XCircle /> Tolak Pesanan
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>Yakin Menolak Order?</AlertDialogTitle>
          <AlertDialogDescription className="mb-2">
            Beri alasan jelas
          </AlertDialogDescription>

          <Textarea
            disabled={isPending}
            placeholder="Contoh : Bahan tidak tersedia"
            value={rejectedReason}
            onChange={(e) => setRejectedReason(e.target.value)}
            className="h-40"
          />
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-2 gap-4">
          <AlertDialogCancel asChild>
            <Button size={"lg"} variant={"outline"}>
              Batal
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
