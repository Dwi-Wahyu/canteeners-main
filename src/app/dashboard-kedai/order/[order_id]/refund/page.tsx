import { auth } from "@/config/auth";
import { getShopOrderDetail } from "@/features/order/lib/order-queries";
import { notFound, redirect } from "next/navigation";
import { ShopRefundPageClient } from "./client";

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

  const order = await getShopOrderDetail(order_id);

  if (!order || !order.refund) {
    return notFound();
  }

  return <ShopRefundPageClient order={order} orderId={order_id} />;
}
