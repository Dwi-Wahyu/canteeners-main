"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/helper/get-image-url";
import { AlertCircle, MessageSquareWarning } from "lucide-react";
import NavButton from "@/components/nav-button";
import { OrderStatus } from "@/generated/prisma";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";

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
  const canFileComplaint = order.status === "COMPLETED" && !order.complaint;
  const hasComplaint = !!order.complaint;
  const [isOpenProof, setIsOpenProof] = useState(false);

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
                Komplain
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ada masalah dengan pesanan? Ajukan komplain dan kami akan
                membantu menyelesaikannya.
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
                  Komplain
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-1">Status</Label>
                <Badge
                  variant={complaintStatusMap[order.complaint.status].variant}
                >
                  {complaintStatusMap[order.complaint.status].label}
                </Badge>
              </div>

              {order.complaint.proof_url && (
                <div>
                  <Label className="mb-1">Bukti</Label>

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

              {order.complaint.feedback && (
                <Alert className="bg-orange-50 border-orange-200">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800">
                    Tanggapan dari Pemilik Kedai
                  </AlertTitle>
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
