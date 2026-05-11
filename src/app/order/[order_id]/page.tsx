import { auth } from "@/config/auth";
import { getCustomerOrderDetail } from "@/features/order/lib/order-queries";
import CustomerOrderDetailClient from "@/features/order/ui/customer-order-detail-client";
import { ChevronLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function OrderDetailPage({
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

  return (
    <div>
      <div className="p-4 flex items-center gap-2 justify-between bg-primary sticky top-0 z-10 text-primary-foreground">
        <div className="flex gap-2 items-center">
          <Link href={"/chat/" + order.conversation_id}>
            <ChevronLeft />
          </Link>
          <h1 className="text-xl font-semibold">Detail Order</h1>
        </div>

        <Link href={"/chat/" + order.conversation_id}>
          <MessageCircle className="w-6 h-6" />
        </Link>
      </div>

      <CustomerOrderDetailClient order={order} />
    </div>
  );
}
