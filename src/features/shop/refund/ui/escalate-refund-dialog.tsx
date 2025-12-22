"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EscalateRefundSchema,
  EscalateRefundInput,
} from "../types/refund-schema";
import { escalateRefund } from "../lib/refund-actions";
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
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EscalateRefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refundId: string;
  onSuccess?: () => void;
}

export function EscalateRefundDialog({
  open,
  onOpenChange,
  refundId,
  onSuccess,
}: EscalateRefundDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EscalateRefundInput>({
    resolver: zodResolver(EscalateRefundSchema),
    defaultValues: {
      refund_id: refundId,
      escalated_reason: "",
    },
  });

  const onSubmit = async (data: EscalateRefundInput) => {
    setIsSubmitting(true);

    try {
      const result = await escalateRefund(data);

      if (result.success) {
        toast.success("Refund berhasil dieskalasi ke admin");
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error.message || "Gagal mengeskalasi refund");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-start">Eskalasi ke Admin</DialogTitle>
          <DialogDescription className="text-start">
            Laporkan refund ini ke admin jika Anda mendeteksi adanya kecurangan
            atau aktivitas yang mencurigakan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Peringatan</AlertTitle>
              <AlertDescription className="text-sm">
                Eskalasi ke admin hanya untuk kasus serius seperti dugaan
                penipuan atau penyalahgunaan. Admin akan meninjau laporan Anda.
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="escalated_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan Eskalasi *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan detail kecurigaan atau masalah yang Anda temukan..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimal 10 karakter, maksimal 500 karakter. Jelaskan secara
                    detail mengapa refund ini perlu ditangani oleh admin.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert>
              <AlertDescription className="text-sm">
                Setelah dieskalasi, refund ini akan ditinjau oleh tim admin.
                Anda akan dihubungi jika diperlukan informasi tambahan.
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
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <AlertTriangle className="h-4 w-4" />
                Eskalasi ke Admin
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
