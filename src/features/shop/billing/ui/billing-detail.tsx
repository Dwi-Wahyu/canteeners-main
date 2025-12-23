"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingStatusBadge } from "./billing-status-badge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar, Info, Store, Receipt, Minus, FileText } from "lucide-react";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { GetBillingDetail } from "../types/billing-queries-types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatRupiah } from "@/helper/format-rupiah";

interface BillingDetailProps {
  billing: GetBillingDetail;
}

export function BillingDetail({ billing }: BillingDetailProps) {
  if (!billing) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tagihan tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <TopbarWithBackButton
        title="Detail Tagihan"
        backUrl="/dashboard-kedai/tagihan"
      />

      <div className="space-y-4">
        {/* Billing Amount Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5" />
              Rincian Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Mulai</span>
              <span className="font-medium">
                {format(new Date(billing.start_date), "dd MMMM yyyy", {
                  locale: localeId,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Selesai</span>
              <span className="font-medium">
                {format(new Date(billing.end_date), "dd MMMM yyyy", {
                  locale: localeId,
                })}
              </span>
            </div>

            {/* Subtotal */}
            <div className="flex justify-between items-center py-2">
              <div className="space-y-1">
                <p className="font-medium">Komisi Order</p>
                <p className="text-xs text-muted-foreground">
                  Rp 1.000 per kuantitas item
                </p>
              </div>
              <span className="font-semibold text-lg">
                {formatRupiah(billing.subtotal)}
              </span>
            </div>

            {/* Refund */}
            {billing.refund > 0 && (
              <div className="flex justify-between items-center py-2 border-t">
                <div className="space-y-1">
                  <p className="font-medium">Pengurangan Refund</p>
                  <p className="text-xs text-muted-foreground">
                    Total refund yang diproses
                  </p>
                </div>
                <span className="font-semibold text-lg text-red-500">
                  <Minus className="inline h-4 w-4" />
                  {formatRupiah(billing.refund)}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-muted/30 rounded-lg px-4">
              <div className="space-y-1">
                <p className="font-bold text-lg">Total Tagihan</p>
                <p className="text-xs text-muted-foreground">
                  Jumlah yang harus dibayar
                </p>
              </div>
              <span className="font-bold text-2xl text-primary">
                {formatRupiah(billing.total)}
              </span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-muted-foreground">Status Pembayaran</span>
              <BillingStatusBadge status={billing.status} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Order Dalam Periode Waktu
            </CardTitle>
          </CardHeader>

          <CardContent>
            {billing.shop.orders.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground italic">
                Tidak ada order pada periode ini.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-md text-sm flex justify-between">
                  <span>
                    Total Order: <strong>{billing.shop.orders.length}</strong>
                  </span>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <div className="max-h-100 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0 shadow-sm">
                        <tr className="text-left">
                          <th className="p-3 font-medium">Order</th>
                          <th className="p-3 font-medium text-center">Qty</th>
                          <th className="p-3 font-medium text-right">Komisi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {billing.shop.orders.map((order) => {
                          const totalQty = order.order_items.reduce(
                            (acc, item) => acc + item.quantity,
                            0
                          );
                          const commission = totalQty * 1000;

                          return (
                            <tr
                              key={order.id}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <td className="p-3">
                                <p className="font-medium uppercase text-[10px] text-muted-foreground">
                                  #{order.id.slice(-6)}
                                </p>
                                <p className="text-xs">
                                  {format(
                                    new Date(order.created_at),
                                    "dd MMM, HH:mm",
                                    { locale: localeId }
                                  )}
                                </p>
                              </td>
                              <td className="p-3 text-center font-medium">
                                {totalQty}
                              </td>
                              <td className="p-3 text-right font-semibold text-primary">
                                {formatRupiah(commission)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground text-center">
                  * Menampilkan maksimal order yang selesai dalam rentang waktu
                  billing.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Tagihan ini dibuat oleh admin. Untuk pertanyaan lebih lanjut,
            silakan hubungi admin kantin.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
