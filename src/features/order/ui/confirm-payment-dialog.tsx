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
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { Check } from "lucide-react";
import { confirmPayment } from "../lib/order-actions";
import { Input } from "@/components/ui/input";

export default function ConfirmPaymentDialog({
  order_id,
}: {
  order_id: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [estimation, setEstimation] = useState<number>(5);

  async function handleConfirm() {
    startTransition(async () => {
      const result = await confirmPayment({
        order_id,
        estimation,
      });

      if (result.success) {
        setIsOpen(false);
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
        setIsOpen(false);
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
    });
  }

  const estimationOptions = [5, 10, 30, 60];

  function handleEstimationClick(value: number) {
    setEstimation(value);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
            Berikan estimasi waktu pengerjaan dan pastikan anda sudah mulai
            menyiapkan pesanan ini.
          </AlertDialogDescription>

          <div className="relative mt-2">
            <Input
              type="number"
              value={estimation}
              onChange={(e) => setEstimation(parseInt(e.target.value) || 0)}
              disabled={isPending}
              className="peer pr-13"
            />
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 text-sm peer-disabled:opacity-50">
              Menit
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {estimationOptions.map((value) => (
              <Button
                key={value}
                type="button"
                variant={estimation === value ? "secondary" : "outline"}
                onClick={() => handleEstimationClick(value)}
                disabled={isPending}
              >
                {value}
              </Button>
            ))}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            onClick={() => setIsOpen(false)}
            variant={"outline"}
            size={"lg"}
          >
            Batal
          </Button>
          <Button
            size={"lg"}
            onClick={handleConfirm}
            disabled={isPending || estimation <= 0}
          >
            Konfirmasi
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
