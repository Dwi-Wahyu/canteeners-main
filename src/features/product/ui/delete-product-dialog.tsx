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
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { deleteProduct } from "../lib/product-actions";
import { notificationDialog } from "@/hooks/use-notification-dialog";

export default function DeleteProductDialog({
  product_id,
}: {
  product_id: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async () => {
      return deleteProduct(product_id);
    },
  });

  async function handleConfirm() {
    const result = await mutateAsync();

    if (result.success) {
      setOpen(false);
      notificationDialog.success({
        title: "Berhasil Hapus Produk",
        message: "Data yang terhubung dengan produk akan terpengaruh",
        actionButtons: (
          <div className="flex justify-center">
            <Button variant={"outline"}>Ya, Mengerti</Button>
          </div>
        ),
      });
      router.push("/dashboard-kedai/produk");
    } else {
      setOpen(false);
      notificationDialog.error({
        title: "Gagal Menghapus Varian",
        message: "Silakan hubungi CS",
      });
      console.log(result.error);
    }
  }

  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild disabled={isPending}>
          <Button variant={"destructive"}>Hapus</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">
              Yakin Menghapus Produk?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              Seluruh order yang memilih produk ini akan terpengaruh. Tindakan
              tidak dapat dibatalkan
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-end items-center flex-row gap-4">
            <AlertDialogCancel asChild>
              <Button size={"lg"} variant={"outline"}>
                Batal
              </Button>
            </AlertDialogCancel>
            <Button
              size={"lg"}
              onClick={handleConfirm}
              variant={"destructive"}
              disabled={isPending}
            >
              {isPending ? <Loader className="animate-spin" /> : "Yakin"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
