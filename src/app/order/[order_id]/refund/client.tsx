"use client";

import { useState } from "react";
import { RefundDetails } from "@/features/shop/refund/ui/refund-details";
import { CreateRefundForm } from "@/features/shop/refund/ui/create-refund-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, DollarSign, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "nextjs-toploader/app";
import { useWatchOrderUpdate } from "@/hooks/use-watch-order-update";
import { useWatchRefundUpdate } from "@/hooks/use-watch-refund-update";
import { GetCustomerOrderDetail } from "@/features/order/types/order-queries-types";

interface CustomerRefundPageClientProps {
  order: GetCustomerOrderDetail;
  orderId: string;
}

export function CustomerRefundPageClient({
  order: initialOrder,
  orderId,
}: CustomerRefundPageClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const { orderData } = useWatchOrderUpdate(orderId);
  const order =
    (orderData as unknown as GetCustomerOrderDetail) || initialOrder;

  // Aktifkan kembali listener khusus refund untuk realtime bus
  const refundId = order?.refund?.id;
  useWatchRefundUpdate(refundId, ["order-detail", orderId]);

  if (!order) {
    return notFound();
  }

  const canRequestRefund = !order.refund && order.status === "COMPLETED";

  return (
    <div>
      <div className="p-4 flex items-center gap-2 justify-between bg-primary sticky top-0 z-10 text-primary-foreground">
        <div className="flex gap-2 items-center">
          <Link href={`/order/${orderId}`}>
            <ChevronLeft />
          </Link>
          <h1 className="text-xl font-semibold">Refund</h1>
        </div>
      </div>

      <div className="p-5">
        <Card>
          <CardHeader>
            <CardTitle>
              {order.refund ? "Detail Refund" : "Ajukan Refund"}
            </CardTitle>
            <CardDescription>
              {order.refund
                ? "Informasi lengkap permintaan pengembalian dana Anda"
                : "Ajukan permintaan pengembalian dana untuk pesanan ini"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Request Refund - Terms and Button */}
            {canRequestRefund && !showForm && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">Syarat Pengajuan Refund:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Pesanan harus berstatus selesai</li>
                      <li>Pilih alasan refund dengan benar</li>
                      <li>Upload bukti komplain</li>
                      <li>Refund akan ditinjau oleh pemilik kedai</li>
                    </ul>
                    <Link
                      href={`/panduan/pelanggan/refund?back_url=/order/${orderId}/refund`}
                      className="text-primary hover:underline text-sm mt-2 inline-block"
                    >
                      Baca Panduan Refund Lengkap →
                    </Link>
                  </AlertDescription>
                </Alert>

                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowForm(true)}
                >
                  <DollarSign className="h-4 w-4" />
                  Buat Pengajuan
                </Button>
              </div>
            )}

            {/* Request Refund - Form */}
            {canRequestRefund && showForm && (
              <CreateRefundForm
                order={order}
                onSuccess={() => router.refresh()}
                onCancel={() => setShowForm(false)}
              />
            )}

            {/* Refund Not Available */}
            {!order.refund && !canRequestRefund && (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Refund hanya dapat diajukan untuk pesanan yang sudah selesai.
                </p>
              </div>
            )}

            {/* Refund Details */}
            {order.refund && (
              <RefundDetails
                refund={order.refund as any}
                userRole="CUSTOMER"
                onRefresh={() => router.refresh()}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
