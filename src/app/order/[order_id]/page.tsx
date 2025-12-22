import { auth } from "@/config/auth";
import { getCustomerOrderDetail } from "@/features/order/lib/order-queries";
import CustomerOrderDetailClient from "@/features/order/ui/customer-order-detail-client";
import OrderReviewSection from "@/features/order/ui/order-review-section";
import OrderComplaintSection from "@/features/order/ui/order-complaint-section";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderRefundSection } from "@/features/order/ui/order-refund-section";
import { revalidatePath } from "next/cache";

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
      </div>

      <div className="p-5 space-y-5">
        <CustomerOrderDetailClient order={order} />

        <OrderComplaintSection order={order} />

        <OrderRefundSection order={order as any} userRole="CUSTOMER" />

        {order.status === "COMPLETED" && (
          <OrderReviewSection
            isUserCustomer={true}
            order_id={order.id}
            prevTestimony={order.testimony}
          />
        )}
      </div>
    </div>
  );
}
