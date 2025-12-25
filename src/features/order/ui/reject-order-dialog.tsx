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
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { rejectOrder } from "../lib/order-actions";
import { Loader2, XCircle } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

export default function RejectOrderDialog({ order_id }: { order_id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

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
      setIsOpen(false);
      router.refresh();
      notificationDialog.success({
        title: "Berhasil menolak order",
        actionButtons: (
          <Button
            onClick={notificationDialog.hide}
            size={"lg"}
            variant={"outline"}
          >
            Tutup
          </Button>
        ),
      });
    } else {
      setIsOpen(false);
      notificationDialog.error({
        title: "Terjadi Kesalahan",
        message: "Silakan hubungi CS",
      });
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
          <AlertDialogTitle>Yakin Menolak Pesanan?</AlertDialogTitle>
          <AlertDialogDescription className="mb-2">
            Beri alasan jelas
          </AlertDialogDescription>

          <Textarea
            disabled={isPending}
            placeholder="Bahan tidak tersedia"
            value={rejectedReason}
            onChange={(e) => setRejectedReason(e.target.value)}
            className="h-40"
          />
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setIsOpen(false)}
            size={"lg"}
            variant={"outline"}
          >
            Batal
          </Button>
          <Button
            size={"lg"}
            variant={"destructive"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Yakin"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
