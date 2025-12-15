"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "nextjs-toploader/app";

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
import { deleteCartItem } from "../lib/cart-actions";

export default function DeleteCartItemDialog({
  cart_item_id,
  shop_cart_id,
  className,
}: {
  cart_item_id: string;
  shop_cart_id: string;
  className?: string;
}) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteCartItem(cart_item_id);

      toast.success("Item dihapus dari keranjang");
      router.push(`/keranjang/${shop_cart_id}`);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={"destructive"} className={className}>
          Hapus Item
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-start">
            Yakin Hapus Item Ini?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-start">
            Kamu harus pilih ulang produk
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-2">
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
