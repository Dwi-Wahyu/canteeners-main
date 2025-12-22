import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { getShopOrderDetail } from "@/features/order/lib/order-queries";
import OrderReviewSection from "@/features/order/ui/order-review-section";
import ShopOrderDetailClient from "@/features/order/ui/shop-order-detail-client";
import ShopComplaintSection from "@/features/order/ui/shop-complaint-section";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/config/auth";
import { OrderRefundSection } from "@/features/order/ui/order-refund-section";
import { revalidatePath } from "next/cache";

export default async function ShopOrderDetailPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;

  const session = await auth();

  if (!session) {
    redirect("/login-kedai");
  }

  const order = await getShopOrderDetail(order_id);

  if (!order) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-5">
      <TopbarWithBackButton
        title="Detail Order"
        backUrl={"/dashboard-kedai/chat/" + order.conversation_id}
      />

      <div className="p-5 pt-20 space-y-5">
        <ShopOrderDetailClient order={order} />

        <ShopComplaintSection order={order} />

        <OrderRefundSection order={order as any} userRole="SHOP_OWNER" />

        {order.status === "COMPLETED" && (
          <OrderReviewSection
            isUserCustomer={false}
            order_id={order.id}
            prevTestimony={order.testimony}
          />
        )}
      </div>
    </div>
  );
}
