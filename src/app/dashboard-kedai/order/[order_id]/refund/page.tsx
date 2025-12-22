import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { auth } from "@/config/auth";
import { getRefundByOrderId } from "@/features/shop/refund/lib/refund-queries";
import { RefundDetails } from "@/features/shop/refund/ui/refund-details";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
    <div className="flex flex-col gap-5">
      <TopbarWithBackButton
        title="Detail Refund"
        backUrl={`/dashboard-kedai/order/${order_id}`}
      />

      <div className="p-5 pt-20">
        <Card>
          <CardContent>
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
    </div>
  );
}
