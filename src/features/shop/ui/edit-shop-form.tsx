"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UpdateShopSchema,
  UpdateShopInput,
} from "@/features/shop/types/shop-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Loader, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";
import { FileUploadImage } from "@/components/file-upload-image";
import NavButton from "@/components/nav-button";
import { getShopById } from "../lib/shop-queries";
import { updateShop } from "../lib/shop-actions";
import { getImageUrl } from "@/helper/get-image-url";
import { refundDisbursementModeMapping } from "@/constant/refund-mapping";
import { RefundDisbursementMode, ShopOrderMode } from "@/generated/prisma";
import { shopOrderModeMapping } from "@/constant/order-mode-mapping";

export default function EditShopForm({
  initialData,
}: {
  initialData: NonNullable<Awaited<ReturnType<typeof getShopById>>>;
}) {
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<UpdateShopInput>({
    resolver: zodResolver(UpdateShopSchema),
    defaultValues: {
      id: initialData.id,
      name: initialData.name,
      description: initialData.description ?? "",
      image_url: initialData.image_url,
      order_mode: initialData.order_mode,
      refund_disbursement_mode: initialData.refund_disbursement_mode,
      open_time: initialData.open_time
        ? new Date(initialData.open_time).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      close_time: initialData.close_time
        ? new Date(initialData.close_time).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
    },
  });

  const router = useRouter();

  const onSubmit = async (payload: UpdateShopInput) => {
    if (files.length > 0) {
      const file = files[0];
      const filename = `shops/${file.name}`;
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

    const result = await updateShop(payload);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      console.log(result.error);
      toast.error(
        result.error.message || "Terjadi kesalahan saat menyimpan data."
      );
    }
  };

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
              <FormLabel>Nama Kedai</FormLabel>
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
          name="order_mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mode Pesanan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih mode pesanan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ShopOrderMode).map((value) => (
                    <SelectItem value={value} key={value}>
                      {shopOrderModeMapping[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="refund_disbursement_mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mode Refund</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih mode refund" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(RefundDisbursementMode).map((value) => (
                    <SelectItem value={value} key={value}>
                      {refundDisbursementModeMapping[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="open_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jam Buka</FormLabel>
                <FormControl>
                  <Input type="time" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="close_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jam Tutup</FormLabel>
                <FormControl>
                  <Input type="time" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="w-full">
          <h1 className="mb-2 text-sm">Gambar</h1>

          <FileUploadImage
            multiple={false}
            initialPreviewUrl={getImageUrl(initialData.image_url)}
            onFilesChange={(newFiles) => {
              setFiles(newFiles);
            }}
          />

          {form.formState.errors.image_url && (
            <p data-slot="form-message" className="text-destructive text-sm">
              {form.formState.errors.image_url.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NavButton variant="outline" href={"/admin/kedai"}>
            Kembali
          </NavButton>

          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> Loading
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
