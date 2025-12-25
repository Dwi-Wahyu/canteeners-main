"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdateRefundStatusSchema,
  UpdateRefundStatusInput,
} from "../types/refund-schema";
import { updateRefundStatus } from "../lib/refund-actions";
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
import { Check, X, AlertCircle, Loader } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { refundReasonMapping } from "@/constant/refund-mapping";

interface RespondRefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refund: {
    id: string;
    amount: number;
    reason: string;
    description: string | null;
    complaint_proof_url: string | null;
    affected_items?: Array<{
      order_item_id: string;
    }>;
    order: {
      id: string;
      order_items?: Array<{
        id: string;
        product: {
          name: string;
        };
        quantity: number;
        subtotal: number;
      }>;
    };
  };
  onSuccess?: () => void;
}

export function RespondRefundDialog({
  open,
  onOpenChange,
  refund,
  onSuccess,
}: RespondRefundDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);

  const form = useForm<UpdateRefundStatusInput>({
    resolver: zodResolver(UpdateRefundStatusSchema),
    defaultValues: {
      refund_id: refund.id,
      status: undefined,
      rejected_reason: "",
    },
  });

  const onSubmit = async (data: UpdateRefundStatusInput) => {
    setIsSubmitting(true);

    if (data.status === "REJECTED" && !data.rejected_reason) {
      toast.error("Alasan penolakan harus diisi");
      form.setError("rejected_reason", {
        type: "manual",
        message: "Alasan penolakan harus diisi",
      });
      return;
    }

    try {
      const result = await updateRefundStatus(data);

      if (result.success) {
        toast.success(
          data.status === "APPROVED"
            ? "Refund berhasil disetujui"
            : "Refund ditolak"
        );
        form.reset();
        setShowRejectReason(false);
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

  const handleApprove = () => {
    form.setValue("status", "APPROVED");
    form.handleSubmit(onSubmit)();
  };

  const handleReject = () => {
    setShowRejectReason(true);
  };

  // Extract affected item IDs from refund data
  const affectedItemIds =
    refund.affected_items?.map((item) => item.order_item_id) || [];

  const affectedItems =
    affectedItemIds.length > 0
      ? refund.order.order_items?.filter((item) =>
          affectedItemIds.includes(item.id)
        )
      : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-137.5">
        <DialogHeader>
          <DialogTitle>Tinjau Permintaan Refund</DialogTitle>
          <DialogDescription>
            Tinjau detail permintaan refund dan berikan tanggapan Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Refund Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">
                Jumlah Refund:
              </span>
              <span className="text-lg font-bold">
                Rp{refund.amount.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Alasan:</span>
              <span className="text-sm font-medium">
                {
                  refundReasonMapping[
                    refund.reason as keyof typeof refundReasonMapping
                  ]
                }
              </span>
            </div>
            {refund.description && (
              <div>
                <span className="text-sm text-muted-foreground block mb-1">
                  Deskripsi:
                </span>
                <p className="text-sm bg-background p-2 rounded border">
                  {refund.description}
                </p>
              </div>
            )}
          </div>

          {/* Affected Items */}
          {affectedItems && affectedItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Item yang Bermasalah:</p>
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {affectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}x
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      Rp{item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proof */}
          {refund.complaint_proof_url && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Bukti:</p>
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <Image
                  src={refund.complaint_proof_url}
                  alt="Bukti komplain"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* Reject Reason Form */}
          {showRejectReason && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="rejected_reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alasan Penolakan *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jelaskan mengapa refund ditolak..."
                          className="min-h-25 resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>10-500 karakter</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Customer akan menerima notifikasi dengan alasan penolakan
                    Anda.
                  </AlertDescription>
                </Alert>

                <DialogFooter className="gap-2 grid grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRejectReason(false)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isSubmitting}
                    onClick={() => form.setValue("status", "REJECTED")}
                  >
                    {isSubmitting && (
                      <Loader className="h-4 w-4 animate-spin" />
                    )}
                    <X className="h-4 w-4" />
                    Tolak Refund
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {/* Action Buttons */}
          {!showRejectReason && (
            <DialogFooter className="grid grid-cols-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleReject}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
                Tolak
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Setujui Refund
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
