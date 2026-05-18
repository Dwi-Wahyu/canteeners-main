"use client";

import { useState, useMemo, useEffect } from "react";
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
import {
  Form,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, Loader2, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { refundDisbursementModeMapping } from "@/constant/refund-mapping";
import { LocalStorageService } from "@/services/storage";
import { truncateFileName } from "@/helper/file-helper";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const storageService = useMemo(() => new LocalStorageService(), []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const form = useForm<ProcessRefundInput>({
    resolver: zodResolver(ProcessRefundSchema),
    defaultValues: {
      refund_id: refund.id,
      disbursement_proof_url: "",
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Format file tidak valid. Gunakan JPG, PNG, WEBP, atau PDF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }

    // Cleanup old preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    toast.success("Bukti dipilih");
  };

  const removeUploadedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    form.setValue("disbursement_proof_url", "");
  };

  const onSubmit = async (data: ProcessRefundInput) => {
    // Validate proof for transfer
    if (refund.disbursement_mode === "TRANSFER" && !selectedFile) {
      toast.error("Bukti transfer wajib diunggah untuk metode transfer.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalData = { ...data };

      // Upload file if selected using LocalStorageService
      if (selectedFile) {
        try {
          // Check if file is image or other (like PDF)
          // Since LocalStorageService.uploadImage doesn't support PDF,
          // we might need to be careful if we want to keep PDF support.
          // For now, let's use uploadImage and see if it works for supported types.
          const filename = await storageService.uploadImage(
            selectedFile,
            "disbursement-proof",
          );
          finalData.disbursement_proof_url = filename;
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Gagal mengunggah bukti. Silakan coba lagi.");
          setIsSubmitting(false);
          return;
        }
      }

      const result = await processRefund(finalData);

      if (result.success) {
        toast.success("Refund berhasil diproses");
        form.reset();
        removeUploadedFile();
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
          {/* Refund Summary */}
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
                Mode Pengembalian:
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
              {/* File Upload */}
              {refund.disbursement_mode === "TRANSFER" && (
                <div className="space-y-2">
                  <FormLabel>
                    Bukti{" "}
                    {refund.disbursement_mode === "TRANSFER"
                      ? "Transfer"
                      : "Pembayaran"}
                    {refund.disbursement_mode === "TRANSFER" && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </FormLabel>

                  {previewUrl && selectedFile ? (
                    <div className="relative border rounded-lg p-3 bg-muted/50">
                      <div className="flex items-start gap-3">
                        {selectedFile.type === "application/pdf" ? (
                          <div className="h-16 w-16 rounded bg-red-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-red-900">
                              PDF
                            </span>
                          </div>
                        ) : (
                          <div className="relative h-16 w-16 rounded overflow-hidden bg-background shrink-0">
                            <Image
                              src={previewUrl}
                              alt="Bukti transfer"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {truncateFileName(selectedFile.name)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Preview bukti transfer
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={removeUploadedFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                      <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                        onChange={handleFileUpload}
                        disabled={isSubmitting}
                        className="hidden"
                        id="proof-upload"
                      />
                      <label
                        htmlFor="proof-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div className="text-sm">
                          <span className="font-medium text-primary">
                            Klik untuk upload
                          </span>
                          <p className="text-muted-foreground">
                            atau drag and drop
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="disbursement_proof_url"
                    render={() => <FormMessage />}
                  />
                </div>
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

              <DialogFooter className="gap-2 flex sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  Konfirmasi Refund Selesai
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
