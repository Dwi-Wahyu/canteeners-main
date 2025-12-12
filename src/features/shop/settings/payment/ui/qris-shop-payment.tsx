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
import InputQrisPaymentForm from "./create-qris-payment-form";
import EditQrisPaymentForm from "./edit-qris-payment-form";
import { Edit } from "lucide-react";
import { getShopPaymentByMethod } from "../lib/shop-payment-queries";
import { toggleShopPaymentActive } from "../lib/shop-payment-actions";

export default function QrisShopPayment({ shop_id }: { shop_id: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const {
    data: payment,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["shop-payment-qris", shop_id],
    queryFn: () => getShopPaymentByMethod({ shop_id, method: "QRIS" }),
  });

  const toggleMutation = useMutation({
    mutationFn: () => toggleShopPaymentActive({ shop_id, method: "QRIS" }),
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
        <div className="flex justify-between items-start mb-4">
          <div>
            <CardTitle>QRIS</CardTitle>
            <CardDescription>
              Quick Response Code Indonesian Standard
            </CardDescription>
          </div>
        </div>

        {!payment && (
          <InputQrisPaymentForm shop_id={shop_id} refetch={refetch} />
        )}

        {/* Sudah ada QRIS */}
        {payment && !isEditing && (
          <div className="space-y-2">
            <img
              src={"/uploads/shop-qrcode/" + payment.qr_url}
              alt="QRIS Code"
              className="rounded-lg mb-2 shadow"
            />

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

            <div className="flex gap-2 justify-end">
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit />
                Ubah Data
              </Button>

              <Button
                variant={isActive ? "default" : "outline"}
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
              >
                {isActive ? "Aktifkan" : "Nonaktifkan"}
              </Button>
            </div>
          </div>
        )}

        {payment && isEditing && (
          <EditQrisPaymentForm
            payment={payment}
            shop_id={shop_id}
            setIsEditing={setIsEditing}
            refetch={refetch}
          />
        )}
      </CardContent>
    </Card>
  );
}
