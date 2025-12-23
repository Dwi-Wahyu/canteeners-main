"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BillingStatusBadge } from "./billing-status-badge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Filter, ExternalLink, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { ShopBillingStatus } from "@/generated/prisma";

interface BillingListProps {
  billings: Array<{
    id: string;
    start_date: Date;
    end_date: Date;
    subtotal: number;
    refund: number;
    total: number;
    status: ShopBillingStatus;
  }>;
}

export function BillingList({ billings }: BillingListProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    const params = new URLSearchParams();
    if (status !== "all") {
      params.set("status", status);
    }
    router.push(`/dashboard-kedai/tagihan?${params.toString()}`);
  };

  const statuses = [
    { value: "all", label: "Semua" },
    { value: "PAID", label: "Lunas" },
    { value: "UNPAID", label: "Belum Bayar" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <TopbarWithBackButton title="Kelola Tagihan" backUrl="/dashboard-kedai" />

      <div className="space-y-4">
        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Billings List */}
        {billings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {selectedStatus === "all"
                ? "Belum ada tagihan"
                : "Tidak ada tagihan dengan status ini"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {billings.map((billing) => (
              <Link
                key={billing.id}
                className="mb-4 block"
                href={`/dashboard-kedai/tagihan/${billing.id}`}
              >
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Billing Period */}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">
                            {format(
                              new Date(billing.start_date),
                              "dd MMM yyyy",
                              {
                                locale: localeId,
                              }
                            )}{" "}
                            -{" "}
                            {format(new Date(billing.end_date), "dd MMM yyyy", {
                              locale: localeId,
                            })}
                          </p>
                        </div>

                        {/* Amount Details */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Komisi
                            </span>
                            <span className="font-medium">
                              Rp{billing.subtotal.toLocaleString("id-ID")}
                            </span>
                          </div>
                          {billing.refund > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Refund
                              </span>
                              <span className="text-red-500 font-medium">
                                -Rp{billing.refund.toLocaleString("id-ID")}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-lg pt-1 border-t">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold text-primary">
                              Rp{billing.total.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <BillingStatusBadge status={billing.status} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Summary */}
        {billings.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Menampilkan {billings.length} tagihan
              {selectedStatus !== "all" &&
                ` dengan status ${statuses
                  .find((s) => s.value === selectedStatus)
                  ?.label.toLowerCase()}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
