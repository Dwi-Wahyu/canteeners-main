"use client";

import {
  AlertDialog,
  AlertDialogAction,
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
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AddCartItemNoteSchema,
  AddCartItemNoteInput,
} from "../types/cart-schema";
import { StickyNote } from "lucide-react";
import { addCartItemNotes } from "../lib/cart-actions";

export function AddCartItemNotesDialog({
  cart_item_id,
  defaultNotes,
}: {
  defaultNotes: string | null;
  cart_item_id: string;
}) {
  const form = useForm<AddCartItemNoteInput>({
    resolver: zodResolver(AddCartItemNoteSchema),
    defaultValues: {
      notes: defaultNotes ?? "",
      cart_item_id,
    },
  });

  const [open, setOpen] = useState(false);

  const mutations = useMutation({
    mutationFn: async (payload: AddCartItemNoteInput) => {
      return await addCartItemNotes(payload);
    },
  });

  async function onSubmit(payload: AddCartItemNoteInput) {
    const result = await mutations.mutateAsync(payload);
    if (result.success) {
      setOpen(false);
      toast.success(result.message);
    } else {
      toast.error(result.error.message);
    }
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
            action=""
            id="add-cart-item-notes-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Textarea
                    {...field}
                    placeholder="Tanpa bawang, pedas banget, dll..."
                    className="min-h-24 resize-none"
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
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <Button
            form="add-cart-item-notes-form"
            disabled={mutations.isPending}
          >
            Simpan
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
