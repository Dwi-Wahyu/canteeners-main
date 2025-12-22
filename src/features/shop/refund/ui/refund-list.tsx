"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefundStatusBadge } from "./refund-status-badge";
import {
  refundReasonMapping,
  refundDisbursementModeMapping,
} from "@/constant/refund-mapping";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { DollarSign, ExternalLink, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";

interface RefundListProps {
  refunds: Array<{
    id: string;
    amount: number;
    reason: string;
    status: string;
    requested_at: Date;
    order: {
      id: string;
      customer: {
        user: {
          name: string;
        };
      };
    };
  }>;
}

export function RefundList({ refunds }: RefundListProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    const params = new URLSearchParams();
    if (status !== "all") {
      params.set("status", status);
    }
    router.push(`/dashboard-kedai/refund?${params.toString()}`);
  };

  const statuses = [
    { value: "all", label: "Semua" },
    { value: "PENDING", label: "Menunggu" },
    { value: "APPROVED", label: "Disetujui" },
    { value: "REJECTED", label: "Ditolak" },
    { value: "PROCESSED", label: "Selesai" },
    { value: "ESCALATED", label: "Dieskalasi" },
    { value: "CANCELLED", label: "Dibatalkan" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <TopbarWithBackButton title="Kelola Refund" backUrl="/dashboard-kedai" />

      <div className="space-y-4">
        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[200px]">
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

        {/* Refunds List */}
        {refunds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {selectedStatus === "all"
                ? "Belum ada permintaan refund"
                : "Tidak ada refund dengan status ini"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {refunds.map((refund) => (
              <Card
                key={refund.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Customer Name & Time */}
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {refund.order.customer.user.name}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(refund.requested_at), {
                            addSuffix: true,
                            locale: localeId,
                          })}
                        </p>
                      </div>

                      {/* Order ID */}
                      <p className="text-sm text-muted-foreground">
                        Order:{" "}
                        <span className="font-mono">
                          #{refund.order.id.substring(0, 8)}
                        </span>
                      </p>

                      {/* Amount & Reason */}
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold text-primary">
                          Rp{refund.amount.toLocaleString("id-ID")}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-sm text-muted-foreground">
                          {
                            refundReasonMapping[
                              refund.reason as keyof typeof refundReasonMapping
                            ]
                          }
                        </p>
                      </div>

                      {/* Status Badge */}
                      <RefundStatusBadge status={refund.status as any} />
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/dashboard-kedai/order/${refund.order.id}/refund`}
                    >
                      <Button variant="outline" size="sm">
                        Detail
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {refunds.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Menampilkan {refunds.length} refund
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
