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
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { Loader, Trash } from "lucide-react";
import { deleteShopCart } from "../lib/cart-actions";

export default function DeleteShopCartDialog({
  shop_cart_id,
  backUrl,
}: {
  shop_cart_id: string;
  backUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setIsLoading(true);

    try {
      const result = await deleteShopCart(shop_cart_id);

      if (result.success) {
        setOpen(false);
        router.push(backUrl);
      } else {
        notificationDialog.error({
          title: "Gagal Menghapus Keranjang",
          message:
            result.error.message ||
            "Terjadi kesalahan saat menghapus keranjang. Silakan coba lagi.",
        });
        console.error(result.error);
      }
    } catch (error) {
      console.error(error);
      notificationDialog.error({
        title: "Gagal Menghapus Keranjang",
        message: "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild disabled={isLoading}>
          <Trash className="w-5 h-5 cursor-pointer hover:text-destructive transition-colors" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">
              Yakin Menghapus Keranjang?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              Anda harus menambahkan ulang produk ke keranjang jika ingin
              membelinya nanti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-3">
            <AlertDialogCancel asChild>
              <Button size={"lg"} variant={"outline"} disabled={isLoading}>
                Batal
              </Button>
            </AlertDialogCancel>
            <Button
              size={"lg"}
              onClick={handleConfirm}
              variant={"destructive"}
              disabled={isLoading}
            >
              {isLoading ? <Loader className="animate-spin" /> : "Yakin"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
