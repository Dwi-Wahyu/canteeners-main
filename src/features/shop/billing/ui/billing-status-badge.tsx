import { Badge } from "@/components/ui/badge";
import { ShopBillingStatus } from "@/generated/prisma";

interface BillingStatusBadgeProps {
  status: ShopBillingStatus;
}

const statusConfig = {
  PAID: {
    label: "Lunas",
    variant: "default" as const,
    className: "bg-green-500 hover:bg-green-600",
  },
  UNPAID: {
    label: "Belum Bayar",
    variant: "secondary" as const,
    className: "bg-orange-500 hover:bg-orange-600 text-white",
  },
};

export function BillingStatusBadge({ status }: BillingStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
