import { auth } from "@/config/auth";
import { getShopOrderDetail } from "@/features/order/lib/order-queries";
import { notFound, redirect } from "next/navigation";
import { getRefundById } from "@/features/shop/refund/lib/refund-queries";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  CardDescription,
  CardTitle,
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { EscalateRefundForm } from "@/features/shop/refund/ui/escalate-refund-form";

export default async function ShopEscalateRefundPage({
  params,
  searchParams,
}: {
  params: Promise<{ order_id: string }>;
  searchParams: Promise<{ back_url?: string }>;
}) {
  const { order_id } = await params;
  const { back_url } = await searchParams;

  const session = await auth();

  if (!session) {
    redirect("/login-kedai");
  }

  const order = await getShopOrderDetail(order_id);

  if (!order || !order.refund) {
    return notFound();
  }

  const refund = await getRefundById(order.refund.id);

  if (!refund) {
    return notFound();
  }

  const finalBackUrl = back_url || `/dashboard-kedai/order/${order_id}/refund`;

  return (
    <div className="space-y-4 p-5">
      <div>
        <div className="flex justify-between items-center mb-4">
          <Link
            href={finalBackUrl}
            className="flex gap-1 text-muted-foreground text-sm items-center"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>
      </div>

      <div>
        <CardTitle className="text-xl">Eskalasi ke Admin</CardTitle>
        <CardDescription>
          Laporkan refund ini ke admin jika Anda mendeteksi adanya kecurangan
          atau aktivitas yang mencurigakan.
        </CardDescription>
      </div>

      <EscalateRefundForm refundId={refund.id} backUrl={finalBackUrl} />
    </div>
  );
}
