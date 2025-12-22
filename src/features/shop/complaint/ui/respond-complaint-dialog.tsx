"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdateComplaintSchema,
  UpdateComplaintInput,
} from "../types/complaint-schema";
import { updateShopComplaint } from "../lib/complaint-actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";

interface RespondComplaintDialogProps {
  complaintId: string;
  currentStatus?: string;
  onSuccess?: () => void;
}

export default function RespondComplaintDialog({
  complaintId,
  currentStatus,
  onSuccess,
}: RespondComplaintDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateComplaintInput>({
    resolver: zodResolver(UpdateComplaintSchema),
    defaultValues: {
      complaint_id: complaintId,
      feedback: "",
      status: currentStatus === "PENDING" ? "UNDER_REVIEW" : "RESOLVED",
    },
  });

  const onSubmit = async (data: UpdateComplaintInput) => {
    setIsSubmitting(true);

    try {
      const result = await updateShopComplaint(data);

      if (result.success) {
        toast.success("Tanggapan berhasil dikirim");
        form.reset();
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error.message || "Gagal mengirim tanggapan");
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
        <Button className="w-full">
          <MessageSquare className="mr-2 h-4 w-4" />
          Tanggapi Komplain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tanggapi Komplain Pelanggan</DialogTitle>
          <DialogDescription>
            Berikan tanggapan Anda terhadap komplain pelanggan dan ubah status
            komplain.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggapan *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan tanggapan Anda terhadap komplain ini..."
                      className="min-h-[120px] resize-none"
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

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UNDER_REVIEW">
                        Sedang Ditinjau
                      </SelectItem>
                      <SelectItem value="RESOLVED">Terselesaikan</SelectItem>
                      <SelectItem value="REJECTED">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih status sesuai dengan kondisi komplain
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Kirim Tanggapan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
