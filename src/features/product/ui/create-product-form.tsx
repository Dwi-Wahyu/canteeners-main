"use client";

import { useState } from "react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateProductInput,
  CreateProductSchema,
} from "@/features/product/types/product-schema";
import { useRouter } from "nextjs-toploader/app";
import { Button } from "@/components/ui/button";
import { Loader, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/app/generated/prisma";
import MultipleSelector from "@/components/multiple-select";
import { FileUploadImage } from "@/components/file-upload-image";
import { createProduct } from "../lib/product-actions";
import { notificationDialog } from "@/hooks/use-notification-dialog";

export default function CreateProductForm({
  shop_id,
  categories,
}: {
  shop_id: string;
  categories: Category[];
}) {
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      image_url: "",
      price: "",
      cost: "",
      shop_id,
      categories: [],
    },
  });

  const router = useRouter();

  const onSubmit = async (payload: CreateProductInput) => {
    if (files.length > 0) {
      const file = files[0];
      const filename = `products/${file.name}`;
      const formData = new FormData();

      formData.append("file", file);
      formData.append("filename", filename);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        form.setError("image_url", {
          message: "Gagal mengunggah file melalui API.",
        });
        return;
      }

      payload.image_url = filename;
    }

    if (payload.image_url === "") {
      form.setError("image_url", { message: "Tolong pilih gambar" });
      return;
    }

    const parsedPrice = parseInt(payload.price);

    if (isNaN(parsedPrice)) {
      form.setError("price", { message: "Harga tidak valid" });
      return;
    }

    if (payload.cost && isNaN(parseInt(payload.cost))) {
      form.setError("cost", { message: "Harga modal tidak valid" });
      return;
    }

    const result = await createProduct(payload);

    if (result.success) {
      form.reset();
      setFiles([]);

      notificationDialog.success({
        title: "Sukses input produk",
        message: "Produk akan tersedia di tampilan kedai anda",
      });

      setTimeout(() => {
        router.push("/dashboard-kedai/produk");
      }, 1000);
    } else {
      notificationDialog.success({
        title: result.error.message,
        message: "Silakan hubungi CS",
      });
    }
  };

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id.toString(),
  }));

  return (
    <Form {...form}>
      <form
        className="gap-5 flex flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Singkat</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                    Rp
                  </div>
                  <Input
                    placeholder="5000"
                    type="number"
                    className="peer pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Harga Modal</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                    Rp
                  </div>
                  <Input
                    type="number"
                    className="peer pl-9"
                    {...field}
                    value={field.value ?? ""}
                  />
                </div>
              </FormControl>
              <FormDescription>Untuk menghitung keuntungan</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <FormControl>
                <MultipleSelector
                  options={categoryOptions}
                  onChange={field.onChange}
                  placeholder="Pilih kategori"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full">
          <FormLabel className="mb-2">Gambar</FormLabel>

          <FileUploadImage
            multiple={false}
            onFilesChange={(newFiles: File[]) => {
              setFiles(newFiles);
            }}
          />

          {form.formState.errors.image_url && (
            <p data-slot="form-message" className="text-destructive text-sm">
              {form.formState.errors.image_url.message}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-3">
          <Button
            disabled={form.formState.isSubmitting}
            className="w-full"
            size={"lg"}
            type="submit"
          >
            {form.formState.isSubmitting && !form.formState.errors ? (
              <>
                <Loader className="animate-spin" /> Loading
              </>
            ) : (
              <>
                <Save />
                Simpan
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
