"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CircleAlert, Loader2, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import {
  ReportUserInput,
  ReportUserSchema,
} from "@/features/user/types/user-schema";
import { reportUser } from "@/features/user/lib/user-actions";

const REPORT_REASONS = [
  { id: "HARASSMENT", label: "Pelecehan / Kata-kata kasar" },
  { id: "FRAUD", label: "Indikasi Penipuan" },
  { id: "SPAM", label: "Spam / Mengganggu" },
  { id: "INAPPROPRIATE", label: "Konten tidak pantas" },
  { id: "OTHER", label: "Lainnya" },
];

export function ReportUserDialog({
  reportedUserId,
}: {
  reportedUserId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ReportUserInput>({
    resolver: zodResolver(ReportUserSchema),
    defaultValues: {
      reasons: "SPAM",
      description: "",
      reported_id: reportedUserId,
    },
  });

  async function onSubmit(data: ReportUserInput) {
    setIsLoading(true);
    try {
      const result = await reportUser(data);

      if (result.success) {
        toast.success("Laporan berhasil dikirim.");
        setIsOpen(false);
        form.reset();
      } else {
        toast.error(result.error.message);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error("Gagal mengirim laporan. Silakan coba lagi.");
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="w-full">
          <CircleAlert />
          Laporkan
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-start">
                Laporkan pengguna ini?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-start">
                Bantu kami menjaga komunitas Canteeners tetap aman. Pilih alasan
                yang sesuai dengan pelanggaran yang terjadi.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
              {/* Field Alasan (Checkbox) */}
              <FormField
                control={form.control}
                name="reasons"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Alasan Pelaporan
                    </FormLabel>
                    <div className="grid grid-cols-1 gap-2">
                      {REPORT_REASONS.map((reason) => (
                        <FormField
                          key={reason.id}
                          control={form.control}
                          name="reasons"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={reason.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value === reason.id}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange(reason.id);
                                      } else {
                                        field.onChange(null);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {reason.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Field Deskripsi */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Tambahan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jelaskan lebih detail mengenai pelanggaran..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <AlertDialogFooter className="grid grid-cols-2">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  form.reset();
                }}
                variant={"outline"}
                size={"lg"}
                type="button"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading}
                size={"lg"}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                Kirim Laporan
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
