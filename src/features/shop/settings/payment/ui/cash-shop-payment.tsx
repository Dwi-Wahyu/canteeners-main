"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleShopPaymentActive } from "../lib/shop-payment-actions";
import { getShopPaymentByMethod } from "../lib/shop-payment-queries";

export default function CashShopPayment({ shop_id }: { shop_id: string }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["shop-payment-cash", shop_id],
    queryFn: () => getShopPaymentByMethod({ shop_id, method: "CASH" }),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => toggleShopPaymentActive({ shop_id, method: "CASH" }),
    onSuccess: (res) => {
      if (res.success) {
        refetch();
        toast.success(res.message);
      } else {
        toast.error(res.error?.message ?? "Gagal mengubah status");
      }
    },
  });

  const isActive = data?.active ?? false;
  const buttonText = isActive
    ? "Nonaktifkan Pembayaran Tunai"
    : "Aktifkan Pembayaran Tunai";
  const description = isActive
    ? "Kedai anda menerima pembayaran tunai"
    : "Kedai anda sedang tidak menerima pembayaran tunai";

  if (isLoading) return <Skeleton className="w-full h-40" />;

  return (
    <Card>
      <CardContent>
        <div className="mb-4">
          <CardTitle>Pembayaran Tunai</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </div>

        <Button disabled={isPending} onClick={() => mutate()}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
