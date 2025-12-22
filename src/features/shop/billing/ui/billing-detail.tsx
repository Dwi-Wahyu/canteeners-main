"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingStatusBadge } from "./billing-status-badge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar, Info, Store, Receipt, Minus } from "lucide-react";
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
        {/* Shop Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5" />
              Informasi Toko
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama Toko</span>
              <span className="font-medium">{billing.shop.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pemilik</span>
              <span className="font-medium">
                {billing.shop.owner.user.name}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Billing Period */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Periode Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
          </CardContent>
        </Card>

        {/* Billing Amount Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5" />
              Rincian Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
