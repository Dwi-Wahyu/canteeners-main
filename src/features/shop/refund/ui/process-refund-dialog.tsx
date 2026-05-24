"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProcessRefundSchema,
  ProcessRefundInput,
} from "../types/refund-schema";
import { processRefund } from "../lib/refund-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormLabel } from "@/components/ui/form";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { refundDisbursementModeMapping } from "@/constant/refund-mapping";
import { FileUploadImage } from "@/components/file-upload-image";
import { Field, FieldError } from "@/components/ui/field";

interface ProcessRefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refund: {
    id: string;
    amount: number;
    disbursement_mode: string;
  };
  onSuccess?: () => void;
}

export function ProcessRefundDialog({
  open,
  onOpenChange,
  refund,
  onSuccess,
}: ProcessRefundDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<ProcessRefundInput>({
    resolver: zodResolver(ProcessRefundSchema),
    defaultValues: {
      refund_id: refund.id,
      disbursement_proof_url: "",
    },
  });

  const onSubmit = async (data: ProcessRefundInput) => {
    if (refund.disbursement_mode === "TRANSFER" && files.length === 0) {
      toast.error("Bukti transfer wajib diunggah untuk metode transfer.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalData = { ...data };

      if (files.length > 0) {
        const file = files[0];

        const validTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!validTypes.includes(file.type)) {
          form.setError("disbursement_proof_url", {
            message: "Format file tidak valid. Gunakan JPG, JPEG, atau PNG.",
          });
          setIsSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append("path", "refund-proof");
        formData.append("file", file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        let uploadData;
        const contentType = uploadResponse.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          uploadData = await uploadResponse.json();
        } else {
          if (uploadResponse.status === 413) {
            form.setError("disbursement_proof_url", {
              message: "Ukuran file terlalu besar (Maks 10MB).",
            });
          } else {
            form.setError("disbursement_proof_url", {
              message: "Gagal mengunggah file. Terjadi kesalahan pada server.",
            });
          }
          setIsSubmitting(false);
          return;
        }

        if (!uploadResponse.ok) {
          form.setError("disbursement_proof_url", {
            message:
              uploadData.message ||
              uploadData.error ||
              "Gagal mengunggah file.",
          });
          setIsSubmitting(false);
          return;
        }

        finalData.disbursement_proof_url = uploadData.data.url.split("/").pop();
      }

      const result = await processRefund(finalData);

      if (result.success) {
        toast.success("Refund berhasil diproses");
        form.reset();
        setFiles([]);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error.message || "Gagal memproses refund");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Proses Refund</DialogTitle>
          <DialogDescription>
            {refund.disbursement_mode === "TRANSFER"
              ? " Pastikan bukti transfer valid."
              : " Pastikan customer telah menerima dana."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Jumlah Refund:
              </span>
              <span className="text-lg font-bold">
                Rp{refund.amount.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Metode Pengembalian:
              </span>
              <span className="text-sm font-medium">
                {
                  refundDisbursementModeMapping[
                    refund.disbursement_mode as keyof typeof refundDisbursementModeMapping
                  ]
                }
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {refund.disbursement_mode === "TRANSFER" && (
                <Field>
                  <FormLabel className="mb-2 block">
                    Bukti Transfer{" "}
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FileUploadImage
                    multiple={false}
                    onFilesChange={(newFiles) => {
                      setFiles(newFiles);
                    }}
                    placeholder="Upload File PNG, JPG, JPEG Maks 10MB"
                  />

                  {form.getFieldState("disbursement_proof_url").error && (
                    <FieldError>
                      {
                        form.getFieldState("disbursement_proof_url").error
                          ?.message
                      }
                    </FieldError>
                  )}
                </Field>
              )}

              <Alert>
                <CheckCircle className="h-4 w-4" />
                {refund.disbursement_mode === "TRANSFER" ? (
                  <AlertDescription className="text-sm">
                    Anda menyatakan bahwa dana telah dikirim ke customer.
                    Customer akan menerima notifikasi.
                  </AlertDescription>
                ) : (
                  <AlertDescription className="text-sm">
                    Anda menyatakan bahwa dana telah diterima customer. Pastikan
                    customer konfirmasi dana diterima pada aplikasi agar refund
                    selesai.
                  </AlertDescription>
                )}
              </Alert>

              <DialogFooter className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : null}
                  {refund.disbursement_mode === "TRANSFER"
                    ? "Kirim Bukti"
                    : "Konfirmasi Diterima"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
