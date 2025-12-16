"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createQrisPayment } from "../lib/shop-payment-actions";
import {
  PaymentSchema,
  PaymentSchemaInput,
} from "../types/shop-payment-schema";
import { FileUploadImage } from "@/components/file-upload-image";
import { uuidv4 } from "zod";

export default function InputQrisPaymentForm({
  shop_id,
  refetch,
}: {
  shop_id: string;
  refetch: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      payload,
      shop_id,
    }: {
      payload: PaymentSchemaInput;
      shop_id: string;
    }) => createQrisPayment({ payload, shop_id }),
    onSuccess: (res) => {
      if (res.success) {
        setFiles([]);
        refetch();
        toast.success(res.message);
      } else {
        toast.error(res.error?.message ?? "Gagal menyimpan");
      }
    },
  });

  const form = useForm<PaymentSchemaInput>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      method: "QRIS",
      note: "",
      additional_price: "",
      qr_url: "",
    },
  });

  const onSubmit = async (values: PaymentSchemaInput) => {
    if (files.length > 0) {
      try {
        const file = files[0];
        const filename = `qrcodes/qris/${uuidv4()}${file.name}`;
        const formData = new FormData();

        formData.append("file", file);
        formData.append("filename", filename);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          form.setError("qr_url", {
            message: "Gagal mengunggah file melalui API.",
          });
          return;
        }

        values.qr_url = filename;
      } catch (error: any) {
        toast.error(error.message || "Gagal mengunggah gambar");
        form.setError("qr_url", {
          message: error.message || "Gagal mengunggah gambar",
        });
        return;
      }
    }

    if (values.qr_url === "") {
      form.setError("qr_url", { message: "Tolong pilih gambar" });
      return;
    }

    mutateAsync({
      shop_id,
      payload: values,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <FormField
            control={form.control}
            name="qr_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Gambar QR Code <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <FileUploadImage multiple={false} onFilesChange={setFiles} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan (opsional)</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: QRIS atas nama Budi" {...field} />
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
              <FormLabel>Biaya Tambahan (opsional)</FormLabel>
              <FormControl>
                <Input placeholder="5000" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          Aktifkan Pembayaran
        </Button>
      </form>
    </Form>
  );
}
