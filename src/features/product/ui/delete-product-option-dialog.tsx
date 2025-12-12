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
import { deleteProductOption } from "../lib/product-actions";
import { useRouter } from "next/navigation";
import { Loader, Trash } from "lucide-react";
import { notificationDialog } from "@/hooks/use-notification-dialog";

export default function DeleteProductOptionDialog({
  option_id,
}: {
  option_id: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async () => {
      return deleteProductOption(option_id);
    },
  });

  async function handleConfirm() {
    const result = await mutateAsync();

    if (result.success) {
      setOpen(false);
      router.refresh();
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
          <Button size={"sm"} variant={"ghost"}>
            <Trash /> Hapus
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">Yakin Menghapus Varian?</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              Seluruh order yang memilih varian ini akan terpengaruh. Tindakan
              tidak dapat dibatalkan
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 justify-end">
            <AlertDialogCancel asChild>
              <Button size={"lg"} variant={"outline"}>
                Batal
              </Button>
            </AlertDialogCancel>
            <Button
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
