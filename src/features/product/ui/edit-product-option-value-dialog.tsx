"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
import { Input } from "@/components/ui/input";
import {
  EditProductOptionValueSchema,
  EditProductOptionValueInput,
} from "@/features/product/types/product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit, Loader } from "lucide-react";
import { useState } from "react";
import { ProductOptionValue } from "@/generated/prisma/client";
import { editProductOptionValue } from "../lib/product-actions";

export default function EditProductOptionValueDialog({
  product_id,

  value,
}: {
  product_id: string;

  value: ProductOptionValue;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<EditProductOptionValueInput>({
    resolver: zodResolver(EditProductOptionValueSchema),
    defaultValues: {
      id: value.id,
      value: value.value,
      additional_price: value.additional_price
        ? value.additional_price.toString()
        : "",
      image_url: "",
    },
  });

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: EditProductOptionValueInput) => {
      return await editProductOptionValue({ payload, product_id });
    },
  });

  const onSubmit = async (payload: EditProductOptionValueInput) => {
    if (payload.additional_price && isNaN(parseInt(payload.additional_price))) {
      form.setError("additional_price", { message: "Harga tidak valid" });
      return;
    }

    const result = await mutateAsync(payload);

    if (result.success) {
      toast.success(result.message);
      setOpen(false);
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AlertDialogHeader className="flex gap-5 flex-col">
              <div>
                <AlertDialogTitle className="text-start">
                  Edit Opsi
                </AlertDialogTitle>

                <AlertDialogDescription className="text-start">
                  Masukkan data opsi yang sesuai
                </AlertDialogDescription>
              </div>

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Opsi <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Cth: Tidak Pedas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additional_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Tambahan?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cth: 2000"
                        {...field}
                        type="number"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AlertDialogHeader>
            <AlertDialogFooter className="flex mt-5 flex-row gap-2 justify-end">
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Tambah"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
