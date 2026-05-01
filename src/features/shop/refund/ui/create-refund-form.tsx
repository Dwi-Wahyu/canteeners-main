"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RefundRequestSchema,
  RefundRequestInput,
} from "../types/refund-schema";
import { createRefundRequest } from "../lib/refund-actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AlertCircle, Loader2, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import {
  refundReasonMapping,
  refundDisbursementModeMapping,
} from "@/constant/refund-mapping";
import { RefundDisbursementMode, RefundReason } from "@/generated/prisma";
import { containsBadWords } from "@/lib/moderation/contains-bad-words";
import { LocalStorageService } from "@/services/storage";

interface CreateRefundFormProps {
  order: {
    id: string;
    total_price: number;
    order_items: Array<{
      id: string;
      product: {
        name: string;
        image_url: string;
      };
      quantity: number;
      subtotal: number;
    }>;
    shop: {
      refund_disbursement_mode: string;
    };
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ITEM_LEVEL_REASONS: RefundReason[] = [
  "DAMAGED_FOOD",
  "MISSING_ITEM",
  "WRONG_ORDER",
];

export function CreateRefundForm({
  order,
  onSuccess,
  onCancel,
}: CreateRefundFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const storageService = useMemo(() => new LocalStorageService(), []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const form = useForm<RefundRequestInput>({
    resolver: zodResolver(RefundRequestSchema),
    defaultValues: {
      order_id: order.id,
      reason: undefined,
      description: undefined,
      complaint_proof_url: undefined,
      disbursement_mode: order.shop
        .refund_disbursement_mode as RefundDisbursementMode,
      affected_item_ids: [],
      amount: undefined,
    },
  });

  const selectedReason = form.watch("reason");
  const isItemLevel =
    selectedReason && ITEM_LEVEL_REASONS.includes(selectedReason);

  // Calculate amount from selected items
  const calculatedAmount = useMemo(() => {
    if (!isItemLevel) return 0;

    return order.order_items
      .filter((item) => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.subtotal, 0);
  }, [selectedItems, order.order_items, isItemLevel]);

  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    form.setValue("affected_item_ids", Array.from(newSelected));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format file tidak valid. Gunakan JPG, PNG, atau WebP.");
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

  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    form.setValue("complaint_proof_url", undefined);
  };

  const onSubmit = async (data: RefundRequestInput) => {
    setIsSubmitting(true);

    if (data.description) {
      if (containsBadWords(data.description)) {
        form.setError("description", {
          message: "Mengandung ujaran kebencian",
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      let finalData = { ...data };

      // Upload file if selected using LocalStorageService
      if (selectedFile) {
        try {
          const filename = await storageService.uploadImage(
            selectedFile,
            "complaint-proof",
          );
          finalData.complaint_proof_url = filename;
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Gagal mengunggah bukti. Silakan coba lagi.");
          setIsSubmitting(false);
          return;
        }
      }

      const result = await createRefundRequest(finalData);

      if (result.success) {
        toast.success("Permintaan refund berhasil diajukan");
        form.reset();
        removeSelectedFile();
        setSelectedItems(new Set());
        onSuccess?.();
      } else {
        toast.error(result.error.message || "Gagal mengajukan refund");
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
        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Informasi Pesanan</p>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-mono">#{order.id.substring(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Pesanan:</span>
              <span className="font-semibold">
                Rp{order.total_price.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah Item:</span>
              <span>{order.order_items.length} item</span>
            </div>
          </div>
        </div>

        {/* Reason Select */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Alasan <span className="text-red-500">*</span>
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedItems(new Set());
                  form.setValue("amount", undefined);
                  form.setValue("affected_item_ids", []);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih alasan refund" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(refundReasonMapping).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Item Selection or Manual Amount */}
        {selectedReason && isItemLevel && (
          <div className="space-y-2">
            <FormLabel>
              Pilih Item yang Bermasalah <span className="text-red-500">*</span>
            </FormLabel>
            <FormDescription>
              Pilih item yang rusak/salah/kurang dari daftar pesanan Anda
            </FormDescription>
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {order.order_items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => handleItemToggle(item.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity}x • Rp
                      {item.subtotal.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {selectedItems.size > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-900">
                    Jumlah Refund
                  </span>
                  <span className="text-lg font-bold text-green-700">
                    Rp{calculatedAmount.toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  {selectedItems.size} item dipilih
                </p>
              </div>
            )}
            <FormMessage>
              {form.formState.errors.affected_item_ids?.message}
            </FormMessage>
          </div>
        )}

        {selectedReason && !isItemLevel && (
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah Refund *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      Rp
                    </span>
                    <Input
                      type="number"
                      placeholder="0"
                      className="pl-10"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Maksimal: Rp{order.total_price.toLocaleString("id-ID")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jelaskan detail masalah Anda..."
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

        {/* Disbursement Mode */}
        <FormField
          control={form.control}
          name="disbursement_mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mode Pengembalian Dana <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(refundDisbursementModeMapping).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload */}
        <div className="space-y-2">
          <FormLabel>Bukti</FormLabel>
          <FormDescription>
            Upload foto sebagai bukti (JPG, PNG, WEBP - Maks 5MB)
          </FormDescription>

          {previewUrl && selectedFile ? (
            <div className="relative border rounded-lg p-3 bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="relative h-16 w-16 rounded overflow-hidden bg-background shrink-0">
                  <Image
                    src={previewUrl}
                    alt="Bukti refund"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Preview bukti refund
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={removeSelectedFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
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
                  <p className="text-muted-foreground">atau drag and drop</p>
                </div>
              </label>
            </div>
          )}
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Permintaan refund akan ditinjau oleh pemilik kedai. Pastikan
            informasi yang Anda berikan akurat dan lengkap.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
          )}
          <Button
            type="submit"
            variant={"outline"}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Ajukan Refund
          </Button>
        </div>
      </form>
    </Form>
  );
}
