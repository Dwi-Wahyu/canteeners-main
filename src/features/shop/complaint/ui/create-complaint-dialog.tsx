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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertCircle,
  FileText,
  Loader,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { containsBadWords } from "@/lib/moderation/contains-bad-words";
import { generateFileName } from "@/helper/file-helper";

interface CreateComplaintDialogProps {
  orderId: string;
  onSuccess?: () => void;
}

export default function CreateComplaintDialog({
  orderId,
  onSuccess,
}: CreateComplaintDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ShopComplaintInput>({
    resolver: zodResolver(ShopComplaintSchema),
    defaultValues: {
      order_id: orderId,
      cause: "",
      proof_url: "",
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format file tidak valid. Gunakan JPG, PNG, atau WebP.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      // Generate random filename with original extension
      const randomName = generateFileName(file.name, "complaint-proofs");

      formData.append("file", file);
      formData.append("filename", randomName);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadedFile({
        url: data.url,
        name: file.name,
      });
      form.setValue("proof_url", data.url);
      toast.success("Bukti berhasil diunggah");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal mengunggah bukti. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    form.setValue("proof_url", "");
  };

  const onSubmit = async (data: ShopComplaintInput) => {
    setIsSubmitting(true);

    if (containsBadWords(data.cause)) {
      form.setError("cause", { message: "Mengandung ujaran kebencian" });
      return;
    }

    try {
      const result = await createShopComplaint(data);

      if (result.success) {
        toast.success("Komplain berhasil diajukan");
        form.reset();
        setUploadedFile(null);
        setOpen(false);
        onSuccess?.();
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={"lg"} className="w-full">
          <FileText className="h-4 w-4" />
          Ajukan Komplain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Ajukan Komplain</DialogTitle>
          <DialogDescription>
            Sampaikan keluhan Anda tentang pesanan ini. Kami akan segera
            menindaklanjuti.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Keluhan *</FormLabel>
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
                Upload foto sebagai bukti keluhan (JPG, PNG, WEBP - Maks 5MB)
              </FormDescription>

              {uploadedFile ? (
                <div className="relative border rounded-lg p-3 bg-muted/50">
                  <div className="flex items-start gap-3">
                    <div className="relative h-16 w-16 rounded overflow-hidden bg-background shrink-0">
                      <Image
                        src={uploadedFile.url}
                        alt="Bukti komplain"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Berhasil diunggah
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
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label
                    htmlFor="proof-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
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
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Komplain Anda akan ditinjau oleh pemilik kedai. Pastikan
                informasi yang Anda berikan akurat.
              </AlertDescription>
            </Alert>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size={"lg"}
                onClick={() => setOpen(false)}
                disabled={isSubmitting || isUploading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size={"lg"}
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
                Kirim
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
