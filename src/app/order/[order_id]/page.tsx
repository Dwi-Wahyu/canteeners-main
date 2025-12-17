import { OrderDetailClient } from "@/features/order/ui/order-detail-client";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;

  return (
    <div>
      <OrderDetailClient order_id={order_id} />
    </div>
  );
}
