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
import { useRouter } from "nextjs-toploader/app";
import { deleteProductOptionValue } from "../lib/product-actions";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { Loader, Trash } from "lucide-react";

export default function DeleteOptionValueDialog({
  value_id,
}: {
  value_id: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async () => {
      return deleteProductOptionValue(value_id);
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
        title: "Gagal Menghapus Opsi",
        message: "Silakan hubungi CS",
      });
      console.log(result.error);
    }
  }

  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild disabled={isPending}>
          <Button variant={"ghost"} size={"sm"}>
            <Trash />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin Menghapus Opsi?</AlertDialogTitle>
            <AlertDialogDescription>
              Seluruh order yang memilih opsi ini akan terpengaruh. Tindakan
              tidak dapat dibatalkan
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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
