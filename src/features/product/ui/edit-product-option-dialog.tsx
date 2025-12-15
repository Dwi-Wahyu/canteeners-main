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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Edit, Loader } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductOption, ProductOptionType } from "@/generated/prisma";
import { productOptionTypeMapping } from "@/constant/product-mapping";
import {
  EditProductOptionInput,
  EditProductOptionSchema,
} from "../types/product-schema";
import { editProductOption } from "../lib/product-actions";

export default function EditProductOptionDialog({
  option,
}: {
  option: ProductOption;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<EditProductOptionInput>({
    resolver: zodResolver(EditProductOptionSchema),
    defaultValues: {
      id: option.id,
      option: option.option,
      type: option.type,
      is_required: option.is_required,
    },
  });

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: EditProductOptionInput) => {
      return await editProductOption({
        payload,
        product_id: option.product_id,
      });
    },
  });

  const onSubmit = async (payload: EditProductOptionInput) => {
    const result = await mutateAsync(payload);

    if (result.success) {
      toast.success(result.message);
      form.reset();
      setOpen(false);
    } else {
      toast.error(result.error.message);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={"ghost"}>
          <Edit /> Edit
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AlertDialogHeader className="flex flex-col gap-4">
              <div>
                <AlertDialogTitle className="text-start">
                  Buat Varian Baru
                </AlertDialogTitle>
                <AlertDialogDescription className="text-start">
                  Gunakan nama varian yang deskriptif
                </AlertDialogDescription>
              </div>

              <FormField
                control={form.control}
                name="option"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Varian <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cth: Level Pedas, Ukuran, Topping"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={option.type}
                        onValueChange={(type) => field.onChange(type)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Jenis Varian" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(ProductOptionType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {productOptionTypeMapping[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_required"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormLabel htmlFor="is_required">
                        <Checkbox
                          id="is_required"
                          defaultChecked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked)}
                        />
                        Wajib Menentukan Varian Ini
                      </FormLabel>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AlertDialogHeader>
            <AlertDialogFooter className="flex mt-5 flex-row gap-2 justify-end">
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <Button
                disabled={form.formState.isSubmitting}
                size={"lg"}
                type="submit"
              >
                {isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Simpan Pilihan"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
