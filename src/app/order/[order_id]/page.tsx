import { auth } from "@/config/auth";
import { getCustomerOrderDetail } from "@/features/order/lib/order-queries";
import CustomerOrderDetailClient from "@/features/order/ui/customer-order-detail-client";
import { ChevronLeft, MessageSquare } from "lucide-react";
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
      <div className="p-4 flex items-center justify-between bg-primary sticky top-0 z-10 text-primary-foreground">
        <div className="flex gap-2 items-center">
          <Link href="/riwayat" className="hover:opacity-80 transition-opacity">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold">Detail Order</h1>
        </div>

        {order.conversation_id && (
          <Link
            href={"/chat/" + order.conversation_id}
            className="flex items-center gap-1.5 bg-primary-foreground/15 hover:bg-primary-foreground/25 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </Link>
        )}
      </div>

      <CustomerOrderDetailClient order={order} />
    </div>
  );
}
