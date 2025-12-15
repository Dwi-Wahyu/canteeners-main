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

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Loader } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductOptionType } from "@/generated/prisma/client";
import { productOptionTypeMapping } from "@/constant/product-mapping";
import { createProductOption } from "../lib/product-actions";
import {
  CreateProductOptionSchema,
  CreateProductOptionInput,
} from "../types/product-schema";

export default function CreateProductOptionDialog({
  product_id,
}: {
  product_id: string;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateProductOptionInput>({
    resolver: zodResolver(CreateProductOptionSchema),
    defaultValues: {
      product_id,
      option: "",
      type: "SINGLE",
      is_required: false,
    },
  });

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: CreateProductOptionInput) => {
      return await createProductOption(payload);
    },
  });

  const onSubmit = async (payload: CreateProductOptionInput) => {
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
        <Button variant={"link"} size={"lg"} className="underline">
          Tambah Varian
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AlertDialogHeader className="flex flex-col gap-4">
              <div>
                <AlertDialogTitle className="text-start">
                  Tambah Varian Baru
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
                        defaultValue="SINGLE"
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
                          onCheckedChange={(checked) => field.onChange(checked)}
                        />
                        Pelanggan wajib pilih opsi
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
