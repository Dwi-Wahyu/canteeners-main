import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { getShopOrderDetail } from "@/features/order/lib/order-queries";
import OrderReviewSection from "@/features/order/ui/order-review-section";
import ShopOrderDetailClient from "@/features/order/ui/shop-order-detail-client";
import { notFound } from "next/navigation";

export default async function ShopOrderDetailPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;

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

      <div className="p-5 pt-20">
        <ShopOrderDetailClient order={order} />

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
