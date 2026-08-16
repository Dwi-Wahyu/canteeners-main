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
import { Form, FormDescription, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, Loader2, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { refundDisbursementModeMapping } from "@/constant/refund-mapping";

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

  const form = useForm<ProcessRefundInput>({
    resolver: zodResolver(ProcessRefundSchema),
    defaultValues: {
      refund_id: refund.id,
      disbursement_proof_url: "",
    },
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    form.setValue("disbursement_proof_url", "");
  };

  const onSubmit = async (data: ProcessRefundInput) => {
    setIsSubmitting(true);

    try {
      let finalProofFilename = "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("path", "disbursement-proof");
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Gagal mengunggah bukti transfer");
        }

        const uploadData = await uploadRes.json();
        if (uploadData.data?.url) {
          finalProofFilename = uploadData.data.url.split("/").pop() || "";
        }
      }

      const payload = {
        ...data,
        disbursement_proof_url: finalProofFilename,
      };

      const result = await processRefund(payload);

      if (result.success) {
        toast.success("Refund berhasil diproses");
        form.reset();
        removeSelectedFile();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error.message || "Gagal memproses refund");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Terjadi kesalahan. Silakan coba lagi.");
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
            Konfirmasi bahwa dana refund telah dikirim ke customer.
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
              {/* File Selection & Preview */}
              <div className="space-y-2">
                <FormLabel>Bukti Transfer (Opsional)</FormLabel>
                <FormDescription>
                  Pilih bukti transfer atau pembayaran (JPG, PNG, WEBP, PDF -
                  Maks 5MB)
                </FormDescription>

                {selectedFile ? (
                  <div className="relative border rounded-lg p-3 bg-muted/50">
                    <div className="flex items-start gap-3">
                      {selectedFile.type === "application/pdf" ? (
                        <div className="h-16 w-16 rounded bg-red-100 flex items-center justify-center shrink-0 border">
                          <span className="text-xs font-medium text-red-900">
                            PDF
                          </span>
                        </div>
                      ) : previewUrl ? (
                        <div className="relative h-16 w-16 rounded overflow-hidden bg-background shrink-0 border">
                          <img
                            src={previewUrl}
                            alt="Bukti transfer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Siap diunggah
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={removeSelectedFile}
                        disabled={isSubmitting}
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
                      onChange={handleFileSelect}
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
                          Klik untuk pilih bukti
                        </span>
                        <p className="text-muted-foreground">
                          Maksimal 5MB (JPG, PNG, WebP, PDF)
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Dengan mengkonfirmasi, Anda menyatakan bahwa dana telah
                  dikirim ke customer. Customer akan menerima notifikasi.
                </AlertDescription>
              </Alert>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
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
