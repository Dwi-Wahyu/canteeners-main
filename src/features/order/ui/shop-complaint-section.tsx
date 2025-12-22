"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import RespondComplaintDialog from "@/features/shop/complaint/ui/respond-complaint-dialog";
import { useRouter } from "next/navigation";
import { GetShopOrderDetail } from "@/features/order/types/order-queries-types";

interface ShopComplaintSectionProps {
  order: GetShopOrderDetail;
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

export default function ShopComplaintSection({
  order,
}: ShopComplaintSectionProps) {
  const router = useRouter();

  const hasComplaint = !!order.complaint;
  const canRespond =
    hasComplaint &&
    order.complaint &&
    !["RESOLVED", "REJECTED"].includes(order.complaint.status);

  const handleResponseSuccess = () => {
    router.refresh();
  };

  if (!hasComplaint) {
    return null;
  }

  return (
    <div className="mb-5">
      <h2 className="font-semibold mb-3">Komplain Pelanggan</h2>
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Status Komplain</CardTitle>
            {order.complaint && (
              <Badge
                variant={complaintStatusMap[order.complaint.status].variant}
              >
                {complaintStatusMap[order.complaint.status].label}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer's Complaint */}
          <div>
            <p className="text-sm font-medium mb-1">Keluhan Pelanggan:</p>
            <p className="text-sm text-muted-foreground">
              {order.complaint?.cause}
            </p>
          </div>

          {/* Proof Image */}
          {order.complaint?.proof_url && (
            <div>
              <p className="text-sm font-medium mb-2">Bukti:</p>
              <img
                src={order.complaint.proof_url}
                alt="Bukti komplain"
                className="rounded-lg border max-w-sm w-full"
              />
            </div>
          )}

          {/* Shop's Feedback */}
          {order.complaint?.feedback && (
            <div>
              <p className="text-sm font-medium mb-1">Tanggapan Anda:</p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{order.complaint.feedback}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Response Button */}
          {canRespond && order.complaint && (
            <div className="pt-2">
              <RespondComplaintDialog
                complaintId={order.complaint.id}
                currentStatus={order.complaint.status}
                onSuccess={handleResponseSuccess}
              />
            </div>
          )}

          {/* Already Responded Message */}
          {!canRespond && order.complaint && order.complaint.feedback && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Komplain Sudah Ditanggapi</AlertTitle>
              <AlertDescription>
                Anda telah menanggapi komplain ini dengan status{" "}
                {complaintStatusMap[order.complaint.status].label.toLowerCase()}
                .
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
