"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { useState } from "react";

export default function SnkCheckoutDialog({
  showSnk,
  setShowSnk,
  setCheckouted,
  isCheckoutPending,
}: {
  showSnk: boolean;
  setShowSnk: (checked: boolean) => void;
  setCheckouted: (checkouted: boolean) => void;
  isCheckoutPending: boolean;
}) {
  const [checked, setChecked] = useState(false);

  function handleClickCheckout() {
    setCheckouted(true);
  }

  return (
    <AlertDialog open={showSnk} onOpenChange={setShowSnk}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>Persetujuan Syarat & Ketentuan</AlertDialogTitle>
          <AlertDialogDescription>
            Sebelum melanjutkan ke pembayaran, mohon baca dan setujui Syarat dan
            Ketentuan layanan kami. Persetujuan ini memastikan Anda memahami hak
            dan kewajiban saat bertransaksi di platform ini. Dengan menyetujui,
            Anda siap untuk menyelesaikan pembelian dan kami dapat segera
            memproses pesanan Anda dengan lancar.
          </AlertDialogDescription>

          <div className="flex gap-2 my-2">
            <Checkbox
              checked={checked}
              onCheckedChange={(value) => setChecked(value as boolean)}
              id="snk-checkbox"
            />
            <Label htmlFor="snk-checkbox">
              Saya menyetujui syarat dan ketentuan
            </Label>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-2 gap-4">
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <Button
            disabled={!checked || isCheckoutPending}
            onClick={handleClickCheckout}
          >
            {isCheckoutPending ? (
              <>
                <Loader className="animate-spin" />
              </>
            ) : (
              "Lanjut"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
