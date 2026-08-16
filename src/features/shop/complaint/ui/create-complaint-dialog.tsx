"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShopComplaintSchema,
  ShopComplaintInput,
} from "../types/complaint-schema";
import { createShopComplaint } from "../lib/complaint-actions";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { containsBadWords } from "@/lib/moderation/contains-bad-words";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ShopComplaintInput>({
    resolver: zodResolver(ShopComplaintSchema),
    defaultValues: {
      order_id: orderId,
      cause: "",
      proof_url: "",
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

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    form.setValue("proof_url", "");
  };

  const onSubmit = async (data: ShopComplaintInput) => {
    setIsSubmitting(true);

    if (containsBadWords(data.cause)) {
      form.setError("cause", { message: "Mengandung ujaran kebencian" });
      setIsSubmitting(false);
      return;
    }

    try {
      let finalProofFilename = "";

      // Perform backend upload ONLY upon form submission
      if (selectedFile) {
        const formData = new FormData();
        formData.append("path", "complaint-proof");
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Gagal mengunggah bukti komplain");
        }

        const uploadData = await uploadRes.json();
        if (uploadData.data?.url) {
          finalProofFilename = uploadData.data.url.split("/").pop() || "";
        }
      }

      const payload = {
        ...data,
        proof_url: finalProofFilename,
      };

      const result = await createShopComplaint(payload);

      if (result.success) {
        toast.success("Komplain berhasil diajukan");
        form.reset();
        removeSelectedFile();
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error.message || "Gagal mengajukan komplain");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size={"lg"} className="w-full">
          <FileText className="h-4 w-4" />
          Ajukan Komplain
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Ajukan Komplain</DrawerTitle>
          <DrawerDescription>
            Sampaikan keluhan Anda tentang pesanan ini. Kami akan segera
            menindaklanjuti.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 overflow-y-auto">
          <Form {...form}>
            <form id="create-complaint-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  Pilih foto sebagai bukti keluhan (JPG, PNG, WEBP - Maks 5MB)
                </FormDescription>

                {previewUrl && selectedFile ? (
                  <div className="relative border rounded-lg p-3 bg-muted/50">
                    <div className="flex items-start gap-3">
                      <div className="relative h-16 w-16 rounded overflow-hidden bg-background shrink-0 border">
                        <img
                          src={previewUrl}
                          alt="Bukti komplain"
                          className="w-full h-full object-cover"
                        />
                      </div>
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
                      accept="image/jpeg,image/jpg,image/png,image/webp"
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
                          Maksimal 5MB (JPG, PNG, WebP)
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
            </form>
          </Form>
        </div>

        <DrawerFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="submit"
            form="create-complaint-form"
            size={"lg"}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kirim Komplain
          </Button>
          <DrawerClose asChild>
            <Button
              type="button"
              variant="outline"
              size={"lg"}
              disabled={isSubmitting}
              className="w-full"
            >
              Batal
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
