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
import { useState } from "react";

import { Edit } from "lucide-react";
import CreateBankTransferPaymentForm from "./create-bank-transfer-payment-form";
import EditBankTransferPaymentForm from "./edit-bank-transfer-payment-fom";
import { Badge } from "@/components/ui/badge";
import { getShopPaymentByMethod } from "../lib/shop-payment-queries";
import { toggleShopPaymentActive } from "../lib/shop-payment-actions";

export default function BankTransferPayment({ shop_id }: { shop_id: string }) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: payment,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["shop-payment-bank-transfer", shop_id],
    queryFn: () => getShopPaymentByMethod({ shop_id, method: "BANK_TRANSFER" }),
  });

  const toggleMutation = useMutation({
    mutationFn: () =>
      toggleShopPaymentActive({ shop_id, method: "BANK_TRANSFER" }),
    onSuccess: (res) => {
      if (res.success) {
        refetch();
        toast.success(res.message);
      } else {
        toast.error(res.error?.message ?? "Gagal mengubah status");
      }
    },
  });

  if (isLoading) return <Skeleton className="w-full h-96" />;

  const isActive = payment?.active ?? false;

  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-start mb-3">
          <div>
            <CardTitle>Transfer Bank</CardTitle>
            <CardDescription>Pembayaran Transfer Bank</CardDescription>
          </div>
        </div>

        {!payment && (
          <CreateBankTransferPaymentForm shop_id={shop_id} refetch={refetch} />
        )}

        {payment && !isEditing && (
          <div className="space-y-2">
            <div>
              <h1 className="font-medium">Nomor Rekening</h1>

              <p className="text-muted-foreground">{payment.account_number}</p>
            </div>

            <div>
              <h1 className="font-medium">Catatan</h1>

              <p className="text-muted-foreground">
                {payment.note ? payment.note : "Tidak ada catatan"}{" "}
              </p>
            </div>

            <div>
              <h1 className="font-medium">Biaya Tambahan</h1>

              <p className="text-muted-foreground">
                {payment.additional_price
                  ? `Rp ${payment.additional_price}`
                  : "Tidak ada biaya tambahan"}{" "}
              </p>
            </div>

            <div>
              <h1 className="font-medium">Status</h1>

              <Badge variant={isActive ? "default" : "outline"}>
                {isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit />
                Ubah Data
              </Button>

              <Button
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
              >
                {isActive ? "Nonaktifkan" : "Aktifkan"}
              </Button>
            </div>
          </div>
        )}

        {payment && isEditing && (
          <EditBankTransferPaymentForm
            setIsEditing={setIsEditing}
            payment={payment}
            shop_id={shop_id}
            refetch={refetch}
          />
        )}
      </CardContent>
    </Card>
  );
}
