"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import CreateComplaintDialog from "@/features/shop/complaint/ui/create-complaint-dialog";
import { useRouter } from "next/navigation";
import { GetCustomerOrderDetail } from "@/features/order/types/order-queries-types";

interface OrderComplaintSectionProps {
  order: GetCustomerOrderDetail;
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

  const handleComplaintSuccess = () => {
    router.refresh();
  };

  if (!canFileComplaint && !hasComplaint) {
    return null;
  }

  return (
    <>
      {/* File Complaint */}
      {canFileComplaint && (
        <div className="mb-5">
          <h2 className="font-semibold">Komplain</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Ada masalah dengan pesanan? Ajukan komplain dan kami akan membantu
            menyelesaikannya.
          </p>
          <CreateComplaintDialog
            orderId={order.id}
            onSuccess={handleComplaintSuccess}
          />
        </div>
      )}

      {/* View Complaint Status */}
      {hasComplaint && order.complaint && (
        <div className="mb-5">
          <h2 className="font-semibold mb-3">Komplain</h2>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Status Komplain</CardTitle>
                <Badge
                  variant={complaintStatusMap[order.complaint.status].variant}
                >
                  {complaintStatusMap[order.complaint.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Keluhan:</p>
                <p className="text-sm text-muted-foreground">
                  {order.complaint.cause}
                </p>
              </div>

              {order.complaint.proof_url && (
                <div>
                  <p className="text-sm font-medium mb-2">Bukti:</p>
                  <img
                    src={order.complaint.proof_url}
                    alt="Bukti komplain"
                    className="rounded-lg border max-w-sm w-full"
                  />
                </div>
              )}

              {order.complaint.feedback && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Tanggapan dari Pemilik Kedai</AlertTitle>
                  <AlertDescription>
                    {order.complaint.feedback}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
