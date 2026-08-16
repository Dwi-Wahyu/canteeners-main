import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { getShopOrderDetail } from "@/features/order/lib/order-queries";
import ShopOrderDetailClient from "@/features/order/ui/shop-order-detail-client";
import ShopComplaintSection from "@/features/order/ui/shop-complaint-section";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/config/auth";
import { OrderRefundSection } from "@/features/order/ui/order-refund-section";
import OrderReviewSection from "@/features/order/ui/order-review-section";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

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
    <div className="flex flex-col gap-5 pt-16">
      <TopbarWithBackButton
        title="Detail Order"
        backUrl="/dashboard-kedai/order"
        actionButton={
          order.conversation_id ? (
            <Link
              href={"/dashboard-kedai/chat/" + order.conversation_id}
              className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </Link>
          ) : undefined
        }
      />

      <div className="space-y-5">
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
