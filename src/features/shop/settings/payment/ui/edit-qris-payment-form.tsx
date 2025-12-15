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
import { Payment } from "@/generated/prisma";
import {
  PaymentSchema,
  PaymentSchemaInput,
} from "../types/shop-payment-schema";
import { updateQrisPayment } from "../lib/shop-payment-actions";
import { FileUploadImage } from "@/components/file-upload-image";

export default function EditQrisPaymentForm({
  payment,
  shop_id,
  setIsEditing,
  refetch,
}: {
  payment: Payment;
  shop_id: string;
  setIsEditing: (isEditing: boolean) => void;
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
    }) => updateQrisPayment({ payload, shop_id }),
    onSuccess: (res) => {
      if (res.success) {
        setFiles([]);
        refetch();
        setIsEditing(false);
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
      note: payment.note ?? "",
      additional_price: payment.additional_price?.toString() ?? "",
      qr_url: payment.qr_url,
    },
  });

  const onSubmit = async (values: PaymentSchemaInput) => {
    if (files.length > 0) {
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
            render={() => (
              <FormItem>
                <FormLabel>
                  Gambar QR Code <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <FileUploadImage
                    multiple={false}
                    onFilesChange={setFiles}
                    initialPreviewUrl={"/uploads/shop-qrcode/" + payment.qr_url}
                  />
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
              <FormLabel>Catatan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: KEDAI PAK SUBARJO" {...field} />
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
              <FormLabel>Biaya Tambahan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh : 1000" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 mt-4 gap-2">
          <Button
            onClick={() => setIsEditing(false)}
            type="button"
            variant={"outline"}
          >
            Batal
          </Button>

          <Button type="submit" disabled={isPending}>
            Simpan
          </Button>
        </div>
      </form>
    </Form>
  );
}
