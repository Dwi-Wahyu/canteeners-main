import { auth } from "@/config/auth";
import { getRefundByOrderId } from "@/features/shop/refund/lib/refund-queries";
import { RefundDetails } from "@/features/shop/refund/ui/refund-details";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function ShopRefundPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;

  const session = await auth();

  if (!session) {
    redirect("/login-kedai");
  }

  const refundData = await getRefundByOrderId(order_id);

  if (!refundData) {
    return notFound();
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center mb-0">
        <Link
          href={`/dashboard-kedai/order/${order_id}`}
          className="flex gap-1 text-muted-foreground text-sm items-center"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>

      <div className="mb-2">
        <h2 className="text-2xl font-medium tracking-tight">Detail Refund</h2>
        <div className="text-muted-foreground text-sm">
          Kelola permintaan refund customer untuk pesanan ini
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <RefundDetails
            refund={refundData as any}
            userRole="SHOP_OWNER"
            onRefresh={async () => {
              "use server";
              revalidatePath(`/dashboard-kedai/order/${order_id}/refund`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
