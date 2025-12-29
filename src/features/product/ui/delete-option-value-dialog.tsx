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
import { deleteProductOptionValue } from "../lib/product-actions";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { Loader, Trash } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

export default function DeleteOptionValueDialog({
  value_id,
}: {
  value_id: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  async function handleConfirm() {
    startTransition(async () => {
      const result = await deleteProductOptionValue(value_id);

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setOpen(false);
        notificationDialog.error({
          title: "Gagal Menghapus Opsi",
          message: "Silakan hubungi CS",
        });
        console.error(result.error);
      }
    });
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
