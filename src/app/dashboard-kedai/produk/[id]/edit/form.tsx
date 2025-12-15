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
  EditProductInput,
  EditProductSchema,
} from "@/features/product/types/product-schema";
import { useRouter } from "nextjs-toploader/app";
import { Button } from "@/components/ui/button";
import { Loader, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MultipleSelector from "@/components/multiple-select";
import { FileUploadImage } from "@/components/file-upload-image";
import { updateProduct } from "../../../../../features/product/lib/product-actions";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { Category, Product, ProductCategory } from "@/generated/prisma/client";
import { getImageUrl } from "@/helper/get-image-url";

type ProductWithCategories = Product & {
  categories: (ProductCategory & { category: Category })[];
};

export default function EditProductForm({
  product,
  categories,
}: {
  product: ProductWithCategories;
  categories: Category[];
}) {
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<EditProductInput>({
    resolver: zodResolver(EditProductSchema),
    defaultValues: {
      id: product.id,
      name: product.name,
      description: product.description || "",
      image_url: product.image_url,
      price: product.price.toString(),
      cost: product.cost?.toString() || "",
      shop_id: product.shop_id,
      categories: product.categories.map((c) => ({
        label: c.category.name,
        value: c.category_id.toString(),
      })),
    },
  });

  const router = useRouter();

  const onSubmit = async (payload: EditProductInput) => {
    // Handle Image Upload
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

      const uploadedBlob = await uploadResponse.json();
      payload.image_url = uploadedBlob.url;
    }

    // Since we are editing, if no new file is selected, payload.image_url
    // retains the existing value from defaultValues (form state), which is correct.

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

    const result = await updateProduct(payload);

    if (result.success) {
      // Don't reset form fully on edit to keep values, or maybe redirect immediately
      // form.reset();
      setFiles([]);

      notificationDialog.success({
        title: "Sukses update produk",
        message: "Perubahan produk telah disimpan",
      });

      setTimeout(() => {
        router.push("/dashboard-kedai/produk");
      }, 1000);
    } else {
      notificationDialog.error({
        title: result.error.message,
        message: "Silakan hubungi CS jika masalah berlanjut",
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
                  defaultOptions={categoryOptions} // Use defaultOptions or options depending on component prop
                  options={categoryOptions}
                  value={field.value} // Controlled value
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

          {/* Show existing image preview if no new file is selected, or let FileUploadImage handle initial preview if it supports it.
              The FileUploadImage likely handles new files. For existing image, we might want to show it.
              However, FileUploadImage in this codebase might be simple. 
              Let's check create-product-form usage: <FileUploadImage multiple={false} onFilesChange={...} />
              It doesn't seem to take an initial URL.
              So I'll add a preview of the current image if no new file is selected.
          */}

          {files.length === 0 && product.image_url && (
            <div className="mb-4">
              <img
                src={getImageUrl(product.image_url)}
                alt="Current Product"
                className="w-32 h-32 object-cover rounded-md border"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Gambar saat ini
              </p>
            </div>
          )}

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
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
