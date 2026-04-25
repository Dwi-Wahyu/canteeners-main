import { auth } from "@/config/auth";
import {
  getShopStatus,
} from "@/features/shop/lib/shop-queries";
import { getRecentOrdersByShop } from "@/features/order/lib/order-queries";
import { redirect } from "next/navigation";
import RecentOrdersList from "@/features/order/ui/recent-orders-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BanknoteX,
  ClipboardClock,
  MessageSquareWarning,
  SquareArrowOutUpRight,
} from "lucide-react";
import { formatRupiah } from "@/helper/format-rupiah";
import CashIcon from "@/components/icons/cash-icon";
import NavButton from "@/components/nav-button";
import ToggleShopStatus from "@/features/shop/ui/toggle-shop-open";
import { prisma } from "@/lib/prisma";

export default async function DashboardKedai() {
  const session = await auth();

  if (!session || !session.user.id) {
    redirect("/login-kedai");
  }

  if (!session.user.shopId) {
    return (
      <div className="p-8">
        <h1>Anda belum memiliki kedai. Hubungi admin untuk pembuatan kedai.</h1>
      </div>
    );
  }

  const shopStatus = await getShopStatus(session.user.shopId);

  if (!shopStatus) {
    redirect("/login-kedai");
  }

  const recentOrders = await getRecentOrdersByShop(session.user.shopId, 5);

  const getUnpaidBillingTotals = await prisma.shopBilling.aggregate({
    where: {
      shop_id: session.user.shopId,
      status: "UNPAID",
    },
    _sum: {
      net_total: true,
    },
  });

  return (
    <div className="space-y-5">
      <div className="mb-5">
        <h2 className="text-2xl font-medium tracking-tight">Dashboard</h2>
        <div className="text-muted-foreground">Ringkasan bisnis hari ini</div>
      </div>

      <ToggleShopStatus
        id={session.user.shopId}
        current_status={shopStatus.status}
        open_time={shopStatus.open_time}
        close_time={shopStatus.close_time}
        is_auto_accept={shopStatus.is_auto_accept}
      />

      <div className="grid gap-4 grid-cols-2">
        <NavButton
          href="/dashboard-kedai/order"
          size="lg"
          className="h-14 focus:scale-105"
          variant="outline"
        >
          <ClipboardClock />
          Order Tracking
        </NavButton>

        <NavButton
          href="/dashboard-kedai/komplain"
          size="lg"
          className="h-14 focus:scale-105"
          variant="outline"
        >
          <MessageSquareWarning />
          Komplain
        </NavButton>

        <NavButton
          href="/dashboard-kedai/refund"
          size="lg"
          className="h-14 col-span-2 focus:scale-105"
          variant="outline"
        >
          <BanknoteX />
          Pengajuan Refund
        </NavButton>
      </div>

      <RecentOrdersList orders={recentOrders} />

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Tagihan</CardTitle>
          <CardDescription>Tagihan yang perlu dibayar</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CashIcon />

            <h1 className="text-lg font-semibold">
              {formatRupiah(getUnpaidBillingTotals._sum.net_total || 0)}
            </h1>
          </div>
          <NavButton variant="outline" href={"/dashboard-kedai/tagihan"}>
            <SquareArrowOutUpRight /> Lihat Detail
          </NavButton>
        </CardContent>
      </Card>
    </div>
  );
}
