"use client";

import { getImageUrl } from "@/helper/get-image-url";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import RespondComplaintDialog from "@/features/shop/complaint/ui/respond-complaint-dialog";
import { useRouter } from "next/navigation";
import { GetShopOrderDetail } from "@/features/order/types/order-queries-types";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";

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
  const [isOpenProof, setIsOpenProof] = useState(false);

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
    <Card className="my-4">
      <CardContent className="space-y-4">
        <h2 className="font-semibold mb-3">Komplain Pelanggan</h2>

        <div>
          <Label className="mb-2">Status</Label>
          {order.complaint && (
            <Badge variant={complaintStatusMap[order.complaint.status].variant}>
              {complaintStatusMap[order.complaint.status].label}
            </Badge>
          )}
        </div>

        <div>
          <Label className="mb-2">Keluhan Pelanggan</Label>
          <p className="text-sm text-muted-foreground">
            {order.complaint?.cause}
          </p>
        </div>

        {/* Proof Image */}
        {order.complaint?.proof_url && (
          <div>
            <Label className="mb-2">Bukti</Label>

            <div className="mt-2 relative w-full h-fit max-w-50 overflow-hidden rounded-lg border shadow-sm group">
              <img
                src={getImageUrl(
                  "/complaint-proof/" + order.complaint.proof_url,
                )}
                alt="Bukti Komplain"
                className="object-cover cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => setIsOpenProof(true)}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 italic">
              *Klik gambar untuk memperbesar
            </p>

            <Dialog open={isOpenProof} onOpenChange={setIsOpenProof}>
              <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-visible border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/20 [&>button]:rounded-full [&>button]:p-2 [&>button]:top-[-40px] [&>button]:right-0 sm:[&>button]:right-[-40px] sm:[&>button]:top-0">
                <VisuallyHidden.Root>
                  <DialogTitle>Bukti Komplain</DialogTitle>
                </VisuallyHidden.Root>
                <div className="relative w-full h-full max-h-[85vh] flex items-center justify-center">
                  <img
                    src={getImageUrl(
                      "/complaint-proof/" + order.complaint.proof_url,
                    )}
                    alt="Bukti Komplain Full"
                    className="max-w-full max-h-[85vh] object-contain rounded-md"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Shop's Feedback */}
        {order.complaint?.feedback && (
          <div>
            <Label className="mb-2">Tanggapan Anda</Label>
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
        {/* {!canRespond && order.complaint && order.complaint.feedback && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Komplain Sudah Ditanggapi</AlertTitle>
              <AlertDescription>
                Anda telah menanggapi komplain ini dengan status{" "}
                {complaintStatusMap[order.complaint.status].label.toLowerCase()}
                .
              </AlertDescription>
            </Alert>
          )} */}
      </CardContent>
    </Card>
  );
}
