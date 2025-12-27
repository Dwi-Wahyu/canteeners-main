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
import { useState, useTransition } from "react";
import { Loader2, Trash } from "lucide-react";
import { deleteProduct } from "../lib/product-actions";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "nextjs-toploader/app";

export default function DeleteProductDialog({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const [productNameInput, setProductNameInput] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteProduct(id);

      if (result.success) {
        setIsOpen(false);
        notificationDialog.success({
          title: "Berhasil Hapus Produk",
          message: "Data yang terhubung dengan produk akan terpengaruh",
          actionButtons: (
            <div className="flex justify-center">
              <Button variant={"outline"} onClick={notificationDialog.hide}>
                Ya, Mengerti
              </Button>
            </div>
          ),
        });
        router.push("/dashboard-kedai/produk");
      } else {
        setIsOpen(false);
        notificationDialog.error({
          title: "Gagal Menghapus Produk",
          message: result.error.message || "Silakan hubungi CS",
        });
        console.error(result.error);
      }
    });
  }

  return (
    <div>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild disabled={isPending}>
          <Button
            variant={"outline"}
            className="w-full border-destructive text-destructive h-12"
          >
            <Trash />
            Hapus Produk Ini
          </Button>
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
          <div>
            <h1 className="font-medium text-sm mb-1">Ketik nama produk</h1>
            <Input
              placeholder={name}
              value={productNameInput}
              onChange={(e) => setProductNameInput(e.target.value)}
            />
          </div>
          <AlertDialogFooter className="justify-end items-center flex-row gap-4">
            <Button
              size={"lg"}
              onClick={() => setIsOpen(false)}
              variant={"outline"}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              size={"lg"}
              onClick={handleConfirm}
              variant={"destructive"}
              disabled={isPending || productNameInput !== name}
            >
              {isPending ? <Loader2 className="animate-spin" /> : "Yakin"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
