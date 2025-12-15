"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Payment } from "@/generated/prisma";
import { updateBankTransferPayment } from "../lib/shop-payment-actions";
import {
  PaymentSchema,
  PaymentSchemaInput,
} from "../types/shop-payment-schema";

export default function EditBankTransferPaymentForm({
  shop_id,
  payment,
  refetch,
  setIsEditing,
}: {
  shop_id: string;
  payment: Payment;
  refetch: () => void;
  setIsEditing: (isEditing: boolean) => void;
}) {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      payload,
      shop_id,
    }: {
      payload: PaymentSchemaInput;
      shop_id: string;
    }) => updateBankTransferPayment({ payload, shop_id }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        refetch();
      } else {
        toast.error(res.error?.message ?? "Gagal menyimpan");
      }
    },
  });

  const form = useForm<PaymentSchemaInput>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      method: "BANK_TRANSFER",
      note: payment.note ?? "",
      account_number: payment.account_number ?? "",
      additional_price: payment.additional_price?.toString() ?? "",
    },
  });

  const onSubmit = async (values: PaymentSchemaInput) => {
    mutateAsync({
      shop_id,
      payload: values,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="account_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nomor Rekening <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh : Ahmad Subarjo (BNI)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additional_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biaya Tambahan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh : 1000" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setIsEditing(false)}
            type="button"
            variant={"outline"}
          >
            Batal
          </Button>

          <Button type="submit" disabled={isPending}>
            Simpan
          </Button>
        </div>
      </form>
    </Form>
  );
}
