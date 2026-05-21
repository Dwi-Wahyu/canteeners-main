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
import { useRouter } from "next/navigation";

export function EscalateRefundForm({
  refundId,
  backUrl,
}: {
  refundId: string;
  backUrl: string;
}) {
  const router = useRouter();
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
        router.push(backUrl);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Peringatan</AlertTitle>
          <AlertDescription className="text-sm">
            Eskalasi ke admin hanya untuk kasus serius seperti dugaan penipuan
            atau penyalahgunaan. Admin akan meninjau laporan Anda.
          </AlertDescription>
        </Alert>

        <FormField
          control={form.control}
          name="escalated_reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Alasan Eskalasi <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jelaskan detail kecurigaan atau masalah yang Anda temukan..."
                  className="min-h-32 resize-none"
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
            Setelah dieskalasi, refund ini akan ditinjau oleh tim admin. Anda
            akan dihubungi jika diperlukan informasi tambahan.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(backUrl)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" variant="destructive" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eskalasi ke Admin
          </Button>
        </div>
      </form>
    </Form>
  );
}
