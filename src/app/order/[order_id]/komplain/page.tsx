import { auth } from "@/config/auth";
import { getCustomerOrderDetail } from "@/features/order/lib/order-queries";
import CreateComplaintForm from "@/features/shop/complaint/ui/create-complaint-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function OrderComplaintPage({
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

  // Prevent filing complaint if already exists or order not completed
  if (order.complaint || order.status !== "COMPLETED") {
    redirect(`/order/${order_id}`);
  }

  return (
    <div>
      <div className="p-4 flex items-center gap-2 justify-between bg-primary sticky top-0 z-10 text-primary-foreground">
        <div className="flex gap-2 items-center">
          <Link href={`/order/${order_id}`}>
            <ChevronLeft />
          </Link>
          <h1 className="text-xl font-semibold">Ajukan Komplain</h1>
        </div>
      </div>

      <div className="p-5">
        <Card>
          <CardHeader>
            <CardTitle>Form Komplain</CardTitle>
            <CardDescription>
              Sampaikan keluhan Anda tentang pesanan ini. Kami akan segera
              menindaklanjuti.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateComplaintForm orderId={order_id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
