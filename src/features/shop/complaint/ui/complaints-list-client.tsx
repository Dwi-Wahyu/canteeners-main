"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/helper/get-image-url";

interface Complaint {
  id: string;
  cause: string;
  proof_url: string | null;
  feedback: string | null;
  status: string;
  created_at: Date;
  order: {
    id: string;
    total_price: number;
    created_at: Date;
    customer: {
      user: {
        name: string;
        avatar: string | null;
      };
    };
  };
}

interface ComplaintsListClientProps {
  complaints: Complaint[];
}

const complaintStatusMap: Record<
  string,
  {
    label: string;
    variant: "default" | "destructive" | "secondary" | "outline";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  PENDING: { label: "Menunggu", variant: "outline", icon: Clock },
  UNDER_REVIEW: { label: "Sedang Ditinjau", variant: "secondary", icon: Clock },
  RESOLVED: { label: "Terselesaikan", variant: "default", icon: CheckCircle2 },
  REJECTED: { label: "Ditolak", variant: "destructive", icon: XCircle },
  ESCALATED: { label: "Ditingkatkan", variant: "secondary", icon: AlertCircle },
};

export default function ComplaintsListClient({
  complaints,
}: ComplaintsListClientProps) {
  if (complaints.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum Ada Komplain</h3>
          <p className="text-muted-foreground">
            Tidak ada komplain dari pelanggan saat ini. Pertahankan kualitas
            layanan Anda!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {complaints.map((complaint) => {
        const StatusIcon =
          complaintStatusMap[complaint.status]?.icon || AlertCircle;

        return (
          <Link
            key={complaint.id}
            href={`/dashboard-kedai/order/${complaint.order.id}`}
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Customer Avatar */}
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted shrink-0">
                      {complaint.order.customer.user.avatar ? (
                        <Image
                          src={getImageUrl(
                            complaint.order.customer.user.avatar
                          )}
                          alt={complaint.order.customer.user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-semibold">
                          {complaint.order.customer.user.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">
                          {complaint.order.customer.user.name}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          •
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(complaint.created_at), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {complaint.cause}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            complaintStatusMap[complaint.status]?.variant ||
                            "outline"
                          }
                          className="text-xs"
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {complaintStatusMap[complaint.status]?.label ||
                            complaint.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Order #{complaint.order.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Proof indicator */}
                  {complaint.proof_url && (
                    <div className="shrink-0">
                      <div className="h-12 w-12 rounded overflow-hidden bg-muted border">
                        <Image
                          src={complaint.proof_url}
                          alt="Bukti"
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
