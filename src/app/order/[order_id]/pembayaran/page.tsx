import { getOrderAndPaymentMethod } from "@/features/order/lib/order-queries";
import { notFound } from "next/navigation";
import UploadPaymentProof from "./upload-payment-proof";
import NavButton from "@/components/nav-button";
import { ChevronLeft } from "lucide-react";

export default async function OrderPaymentPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;

  const order = await getOrderAndPaymentMethod(order_id);

  if (!order) {
    return notFound();
  }

  return (
    <div>
      <div className="w-full p-4 gap-2 flex items-center bg-linear-to-r text-primary-foreground from-primary to-primary/90">
        <NavButton
          size="icon"
          variant="ghost"
          href={"/chat/" + order.conversation_id}
        >
          <ChevronLeft />
        </NavButton>

        <h1 className="text-lg font-semibold">Pembayaran</h1>
      </div>

      <UploadPaymentProof order={order} order_id={order_id} />
    </div>
  );
}
