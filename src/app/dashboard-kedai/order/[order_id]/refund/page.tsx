import { auth } from "@/config/auth";
import { getShopOrderDetail } from "@/features/order/lib/order-queries";
import { notFound, redirect } from "next/navigation";
import { getRefundById } from "@/features/shop/refund/lib/refund-queries";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { RefundDetails } from "@/features/shop/refund/ui/refund-details";

export default async function ShopRefundPage({
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

  return (
    <div className="space-y-5 p-5">
      <div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <Link
              href={back_url || `/dashboard-kedai/order/${refund.order_id}`}
              className="flex gap-1 text-muted-foreground text-sm items-center"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali
            </Link>
          </div>

          <CardTitle>Detail Refund</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Kelola permintaan refund customer untuk pesanan ini
          </CardDescription>
        </div>

        <div className="mt-4">
          <RefundDetails refund={refund!} userRole="SHOP_OWNER" />
        </div>
      </div>
    </div>
  );
}
