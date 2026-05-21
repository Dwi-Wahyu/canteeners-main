import { auth } from "@/config/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getRefundById } from "@/features/shop/refund/lib/refund-queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { EscalateRefundForm } from "@/features/shop/refund/ui/escalate-refund-form";

export default async function CustomerEscalateRefundPage({
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
    redirect("/kantin/kantin-kudapan");
  }

  const order = await prisma.order.findUnique({
    where: {
      id: order_id,
    },
    select: {
      id: true,
      status: true,
      refund: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!order || !order.refund) {
    return notFound();
  }

  const refund = await getRefundById(order.refund.id);

  if (!refund) {
    return notFound();
  }

  const finalBackUrl = back_url || `/order/${order_id}/refund`;

  return (
    <div>
      <div className="p-4 flex items-center gap-2 justify-between bg-primary sticky top-0 z-10 text-primary-foreground">
        <div className="flex gap-2 items-center">
          <Link href={finalBackUrl}>
            <ChevronLeft />
          </Link>
          <h1 className="text-xl font-semibold">Eskalasi ke Admin</h1>
        </div>
      </div>

      <div className="p-5">
        <Card>
          <CardHeader>
            <CardTitle>Eskalasi ke Admin</CardTitle>
            <CardDescription>
              Laporkan refund ini ke admin jika Anda mendeteksi adanya kecurangan atau aktivitas yang mencurigakan dari pihak kedai.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EscalateRefundForm refundId={refund.id} backUrl={finalBackUrl} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
