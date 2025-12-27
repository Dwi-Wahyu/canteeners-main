"use client";

import { useState, useTransition } from "react";
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
import { Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MultipleSelector from "@/components/multiple-select";
import { FileUploadImage } from "@/components/file-upload-image";
import { updateProduct } from "../../../../../features/product/lib/product-actions";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { Category, Product, ProductCategory } from "@/generated/prisma";
import { getImageUrl } from "@/helper/get-image-url";
import { generateFileName } from "@/helper/file-helper";
import { del } from "@vercel/blob";

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

  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const onSubmit = async (payload: EditProductInput) => {
    startTransition(async () => {
      // Handle Image Upload
      if (files.length > 0) {
        const file = files[0];
        const filename = generateFileName(file.name, "products");
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

      const isUpdatingImage = payload.image_url !== product.image_url;

      const result = await updateProduct(
        payload,
        isUpdatingImage,
        product.image_url
      );

      if (result.success) {
        setFiles([]);

        notificationDialog.success({
          title: "Sukses update produk",
          message: "Perubahan produk telah disimpan",
        });

        router.push("/dashboard-kedai/produk");
      } else {
        notificationDialog.error({
          title: result.error.message,
          message: "Silakan hubungi CS jika masalah berlanjut",
        });
      }
    });
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
            disabled={isPending}
            className="w-full"
            size={"lg"}
            type="submit"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" /> Loading
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
