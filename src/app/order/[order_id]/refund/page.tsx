import { auth } from "@/config/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, DollarSign } from "lucide-react";
import { RefundDetails } from "@/features/shop/refund/ui/refund-details";
import { CreateRefundForm } from "@/features/shop/refund/ui/create-refund-form";
import { getRefundById } from "@/features/shop/refund/lib/refund-queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

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

  const order = await prisma.order.findUnique({
    where: {
      id: order_id,
    },

    select: {
      id: true,
      total_price: true,
      order_items: {
        select: {
          id: true,
          product: {
            select: {
              name: true,
              image_url: true,
            },
          },
          quantity: true,
          subtotal: true,
        },
      },
      shop: {
        select: {
          refund_disbursement_mode: true,
        },
      },
      status: true,
      refund: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!order) {
    return notFound();
  }

  const refund = await getRefundById(order.refund?.id || "");

  const canRequestRefund = !refund && order.status === "COMPLETED";

  return (
    <div>
      <div className="p-4 flex items-center gap-2 justify-between bg-primary sticky top-0 z-10 text-primary-foreground">
        <div className="flex gap-2 items-center">
          <Link href={`/order/${order_id}`}>
            <ChevronLeft />
          </Link>
          <h1 className="text-xl font-semibold">Refund</h1>
        </div>
      </div>

      <div className="p-5">
        {canRequestRefund && (
          <Card>
            <CardHeader>
              <CardTitle>
                {/* "Detail Refund" */}
                Ajukan Refund
              </CardTitle>
              <CardDescription>
                {/* Informasi lengkap permintaan pengembalian dana Anda */}
                Ajukan permintaan pengembalian dana untuk pesanan ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateRefundForm order={order} />
            </CardContent>
          </Card>
        )}

        {/* Refund Not Available */}
        {!refund && !canRequestRefund && (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Refund hanya dapat diajukan untuk pesanan yang sudah selesai.
            </p>
          </div>
        )}

        {refund && (
          <Card>
            <CardHeader>
              <CardTitle>Detail Refund</CardTitle>
              <CardDescription>
                Informasi lengkap permintaan pengembalian dana Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RefundDetails refund={refund} userRole="CUSTOMER" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
