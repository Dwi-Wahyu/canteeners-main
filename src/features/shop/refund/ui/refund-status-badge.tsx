import { Badge } from "@/components/ui/badge";
import { RefundStatus } from "@/generated/prisma";
import { cn } from "@/lib/utils";

interface RefundStatusBadgeProps {
  status: RefundStatus;
  className?: string;
}

const statusConfig: Record<
  RefundStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
  }
> = {
  PENDING: {
    label: "Menunggu Proses",
    variant: "outline",
    className: "bg-yellow-50 text-yellow-700 border-yellow-300",
  },
  APPROVED: {
    label: "Disetujui",
    variant: "outline",
    className: "bg-blue-50 text-blue-700 border-blue-300",
  },
  REJECTED: {
    label: "Ditolak",
    variant: "destructive",
    className: "",
  },
  PROCESSED: {
    label: "Dana Dikirim",
    variant: "outline",
    className: "bg-green-50 text-green-700 border-green-300",
  },
  COMPLETED: {
    label: "Selesai",
    variant: "outline",
    className: "bg-green-100 text-green-800 border-green-400",
  },
  CANCELLED: {
    label: "Dibatalkan",
    variant: "secondary",
    className: "",
  },
  ESCALATED: {
    label: "Dieskalasi ke Admin",
    variant: "outline",
    className: "bg-purple-50 text-purple-700 border-purple-300",
  },
};

export function RefundStatusBadge({
  status,
  className,
}: RefundStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
