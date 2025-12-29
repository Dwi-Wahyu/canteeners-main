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
import { Field, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AddCartItemNoteSchema,
  AddCartItemNoteInput,
} from "../types/cart-schema";
import { StickyNote, Loader2 } from "lucide-react";
import { addCartItemNote } from "../lib/cart-actions";
import { useRouter } from "nextjs-toploader/app";

export function AddCartItemNotesDialog({
  cart_item_id,
  defaultNote,
}: {
  defaultNote: string | null;
  cart_item_id: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AddCartItemNoteInput>({
    resolver: zodResolver(AddCartItemNoteSchema),
    defaultValues: {
      note: defaultNote ?? "",
      cart_item_id,
    },
  });

  async function onSubmit(payload: AddCartItemNoteInput) {
    startTransition(async () => {
      const result = await addCartItemNote(payload);

      if (result.success) {
        setOpen(false);
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" onClick={() => setOpen(true)} size={"icon"}>
          <StickyNote />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-start">Catatan</AlertDialogTitle>
          <AlertDialogDescription className="text-start">
            Berikan catatan untuk item keranjang
          </AlertDialogDescription>

          <form
            id="add-cart-item-note-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Textarea
                    {...field}
                    placeholder="Tanpa bawang, pedas banget, dll..."
                    className="min-h-24 resize-none"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError
                      className="text-start"
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </form>
        </AlertDialogHeader>
        <AlertDialogFooter className="justify-end items-center flex-row">
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <Button form="add-cart-item-note-form" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Simpan
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
