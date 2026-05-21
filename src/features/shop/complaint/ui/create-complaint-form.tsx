"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShopComplaintSchema,
  ShopComplaintInput,
} from "../types/complaint-schema";
import { createShopComplaint } from "../lib/complaint-actions";
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
import { AlertCircle, Loader } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { containsBadWords } from "@/lib/moderation/contains-bad-words";
import { useRouter } from "next/navigation";
import { FileUploadImage } from "@/components/file-upload-image";

interface CreateComplaintFormProps {
  orderId: string;
}

export default function CreateComplaintForm({
  orderId,
}: CreateComplaintFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ShopComplaintInput>({
    resolver: zodResolver(ShopComplaintSchema),
    defaultValues: {
      order_id: orderId,
      cause: "",
      proof_url: "",
    },
  });

  const handleFilesChange = async (files: File[]) => {
    if (files.length === 0) {
      form.setValue("proof_url", "");
      return;
    }

    const file = files[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("path", "complaint-proof");
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Upload failed");
      }

      const filename = data.data.url.split("/").pop();
      form.setValue("proof_url", filename);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal mengunggah bukti. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ShopComplaintInput) => {
    setIsSubmitting(true);

    if (containsBadWords(data.cause)) {
      form.setError("cause", { message: "Mengandung ujaran kebencian" });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createShopComplaint(data);

      if (result.success) {
        toast.success("Komplain berhasil diajukan");
        form.reset();
        router.push(`/order/${orderId}`);
        router.refresh();
      } else {
        toast.error(result.error.message || "Gagal mengajukan komplain");
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
        <FormField
          control={form.control}
          name="cause"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Deskripsi Keluhan<span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jelaskan masalah yang Anda alami dengan pesanan ini..."
                  className="min-h-30 resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Minimal 10 karakter, maksimal 500 karakter
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Bukti (Opsional)</FormLabel>
          <FormDescription>
            Upload foto sebagai bukti keluhan (JPG, PNG - Maks 5MB)
          </FormDescription>
          <FileUploadImage
            multiple={false}
            onFilesChange={handleFilesChange}
            placeholder="Klik untuk upload atau drag and drop"
          />
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Komplain Anda akan ditinjau oleh pemilik kedai. Pastikan informasi
            yang Anda berikan akurat.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            size={"lg"}
            className="w-full"
            disabled={isSubmitting || isUploading}
          >
            {(isSubmitting || isUploading) && (
              <Loader className="h-4 w-4 animate-spin mr-2" />
            )}
            {isUploading ? "Mengunggah..." : "Kirim Komplain"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size={"lg"}
            className="w-full"
            onClick={() => router.back()}
            disabled={isSubmitting || isUploading}
          >
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
}
