"use client";

import { FileUploadImage } from "@/components/file-upload-image";
import NavButton from "@/components/nav-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { savePaymentProof } from "@/features/order/lib/order-actions";
import { GetOrderAndPaymentMethod } from "@/features/shop/settings/payment/types/shop-payment-queries-types";
import { generateFileName, getFileExtension } from "@/helper/file-helper";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { uuidv4, z } from "zod";

const PaymentFormSchema = z.object({
  order_id: z.string(),
  image_url: z.string(),
});

type PaymentFormInput = z.infer<typeof PaymentFormSchema>;

export default function UploadPaymentProof({
  order,
  order_id,
}: {
  order: GetOrderAndPaymentMethod;
  order_id: string;
}) {
  const [files, setFiles] = useState<File[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PaymentFormInput>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      order_id,
      image_url: "",
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (proof_url: string) => {
      return await savePaymentProof({
        order_id,
        proof_url,
      });
    },
  });

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  const onSubmit = async (payload: PaymentFormInput) => {
    setIsLoading(true);
    if (files.length > 0) {
      const file = files[0];
      const filename = generateFileName(file.name, "payment-proofs");
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

    const result = await mutateAsync(payload.image_url);

    if (result.success) {
      notificationDialog.success({
        title: "Sukses",
        message: "Bukti pembayaran berhasil di kirim",
        actionButtons: (
          <div className="">
            <NavButton href={"/chat/" + order.conversation_id}>
              Kembali
            </NavButton>
          </div>
        ),
      });
    } else {
      notificationDialog.error({
        title: "Gagal",
        message: "Gagal mengunggah bukti pembayaran.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="p-5 flex flex-col gap-4">
      {order.status === "WAITING_SHOP_CONFIRMATION" && (
        <>
          <Alert>
            <AlertTitle>Menunggu Konfirmasi</AlertTitle>
            <AlertDescription>
              Menunggu konfirmasi pembayaran oleh pemilik kedai
            </AlertDescription>
          </Alert>

          {order.payment_proof_url && (
            <Card>
              <CardContent>
                <h1 className="font-medium mb-4">Bukti Pembayaran</h1>
                <img
                  src={getImageUrl(order.payment_proof_url)}
                  className="rounded-lg"
                  alt=""
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {order.status === "WAITING_PAYMENT" && (
        <>
          <Alert variant={"destructive"}>
            <AlertTitle>Perhatian</AlertTitle>
            <AlertDescription>
              Selesaikan pembayaran dalam 10 menit
            </AlertDescription>
          </Alert>

          {order.payment_method === "QRIS" &&
            order.status === "WAITING_PAYMENT" && (
              <Card>
                <CardContent>
                  {order.shop.payments
                    .filter((p) => p.method === "QRIS")
                    .map((payment, idx) => {
                      if (!payment.qr_url) {
                        return <div>Belum ada qr code</div>;
                      }

                      return (
                        <img
                          key={idx}
                          className="rounded-lg"
                          src={getImageUrl(payment.qr_url)}
                        />
                      );
                    })}
                </CardContent>
              </Card>
            )}

          {order.payment_method === "BANK_TRANSFER" &&
            order.status === "WAITING_PAYMENT" && (
              <Card>
                <CardContent>
                  {order.shop.payments
                    .filter((p) => p.method === "BANK_TRANSFER")
                    .map((payment, idx) => {
                      if (!payment.account_number) {
                        return <div key={idx}>Belum ada nomor rekening</div>;
                      }

                      return (
                        <div key={idx}>
                          <h1>{payment.note}</h1>
                          <h1>{payment.account_number}</h1>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            )}

          <div>
            <div className="mb-2">
              <h1 className="font-medium">Upload Bukti Pembayaran</h1>
              <h1 className="text-muted-foreground">
                Upload bukti pembayaran sejumlah{" "}
                <span className="font-medium text-primary">
                  {formatRupiah(order.total_price)}
                </span>{" "}
                ke platform yang disediakan
              </h1>
            </div>

            <form id="payment-form" onSubmit={form.handleSubmit(onSubmit)}>
              <Field>
                <FileUploadImage
                  multiple={false}
                  onFilesChange={(newFiles) => {
                    setFiles(newFiles);
                  }}
                  placeholder="Upload File PNG,JPG,JPEG Maks 10MB"
                />

                {form.getFieldState("image_url").error && (
                  <FieldError>
                    {form.getFieldState("image_url").error?.message}
                  </FieldError>
                )}

                <Button
                  form="payment-form"
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 h-12"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send className="" />
                  )}
                  Kirim
                </Button>
              </Field>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
