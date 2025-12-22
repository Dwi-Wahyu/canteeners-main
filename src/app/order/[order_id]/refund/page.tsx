import { auth } from "@/config/auth";
import { getCustomerOrderDetail } from "@/features/order/lib/order-queries";
import { notFound, redirect } from "next/navigation";
import { CustomerRefundPageClient } from "./client";

export default async function CustomerRefundPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;

  const session = await auth();

  if (!session) {
    redirect("/kantin/kantin-kudapan");
  }

  const order = await getCustomerOrderDetail(order_id);

  if (!order) {
    return notFound();
  }

  return <CustomerRefundPageClient order={order} orderId={order_id} />;
}
