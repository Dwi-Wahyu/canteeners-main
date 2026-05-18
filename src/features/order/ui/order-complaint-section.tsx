"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/helper/get-image-url";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, MessageSquareWarning } from "lucide-react";
import NavButton from "@/components/nav-button";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@/generated/prisma";

interface OrderComplaintSectionProps {
  order: {
    id: string;
    status: OrderStatus;
    complaint?: {
      status: string;
      cause: string;
      proof_url: string | null;
      feedback: string | null;
    } | null;
  };
}

const complaintStatusMap: Record<
  string,
  {
    label: string;
    variant: "default" | "destructive" | "secondary" | "outline";
  }
> = {
  PENDING: { label: "Menunggu", variant: "outline" },
  UNDER_REVIEW: { label: "Sedang Ditinjau", variant: "secondary" },
  RESOLVED: { label: "Terselesaikan", variant: "default" },
  REJECTED: { label: "Ditolak", variant: "destructive" },
  ESCALATED: { label: "Ditingkatkan", variant: "secondary" },
};

export default function OrderComplaintSection({
  order,
}: OrderComplaintSectionProps) {
  const router = useRouter();

  const canFileComplaint = order.status === "COMPLETED" && !order.complaint;
  const hasComplaint = !!order.complaint;

  if (!canFileComplaint && !hasComplaint) {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4">
        {/* File Complaint */}
        {canFileComplaint && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageSquareWarning className="size-4 text-orange-500" />
                Informasi Komplain
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ada masalah dengan pesanan? Ajukan komplain dan kami akan membantu
                menyelesaikannya.
              </p>
            </div>
            <NavButton
              href={`/order/${order.id}/komplain`}
              variant="outline"
              size={"lg"}
              className="w-full"
            >
              Ajukan Komplain
            </NavButton>
          </div>
        )}

        {/* View Complaint Status */}
        {hasComplaint && order.complaint && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquareWarning className="size-4 text-orange-500" />
                  Status Komplain
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Komplain Anda sedang kami tinjau.
                </p>
              </div>
              <Badge
                variant={complaintStatusMap[order.complaint.status].variant}
              >
                {complaintStatusMap[order.complaint.status].label}
              </Badge>
            </div>

            <div className="space-y-3 pt-2 border-t border-dashed">
              <div>
                <p className="text-sm font-medium mb-1">Keluhan:</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {order.complaint.cause}
                </p>
              </div>

              {order.complaint.proof_url && (
                <div>
                  <p className="text-sm font-medium mb-2">Bukti:</p>
                  <img
                    src={getImageUrl("/complaint-proof/" + order.complaint.proof_url)}
                    alt="Bukti komplain"
                    className="rounded-lg border max-w-sm w-full"
                  />
                </div>
              )}

              {order.complaint.feedback && (
                <Alert className="bg-orange-50 border-orange-200">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800">Tanggapan dari Pemilik Kedai</AlertTitle>
                  <AlertDescription className="text-orange-700/80">
                    {order.complaint.feedback}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
