import { getShopOrderDetail } from "@/features/order/lib/order-queries";
import OrderReviewSection from "@/features/order/ui/order-review-section";
import ShopOrderDetailClient from "@/features/order/ui/shop-order-detail-client";
import ShopComplaintSection from "@/features/order/ui/shop-complaint-section";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/config/auth";
import { OrderRefundSection } from "@/features/order/ui/order-refund-section";
import { ChevronLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

export default async function ShopOrderDetailPage({
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

  if (!order) {
    return notFound();
  }

  const defaultBackUrl = "/dashboard-kedai/chat/" + order.conversation_id;
  const finalBackUrl = back_url || defaultBackUrl;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <Link
          href={finalBackUrl}
          className="flex gap-1 text-muted-foreground text-sm items-center"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali
        </Link>

        <Link
          href={"/dashboard-kedai/chat/" + order.conversation_id}
          className="text-muted-foreground"
        >
          <MessageCircle className="w-5 h-5" />
        </Link>
      </div>

      <div className="mb-2">
        <h2 className="text-2xl font-medium tracking-tight">Detail Order</h2>
      </div>

      <div className="space-y-5">
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
