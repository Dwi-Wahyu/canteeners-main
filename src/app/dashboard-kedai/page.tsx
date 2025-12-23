import { auth } from "@/config/auth";
import { getShopDashboardStats } from "@/features/shop/lib/shop-queries";
import { getRecentOrdersByShop } from "@/features/order/lib/order-queries";
import { redirect } from "next/navigation";
import DashboardStats from "@/features/shop/ui/dashboard-stats";
import RecentOrdersList from "@/features/order/ui/recent-orders-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquareWarning,
  RefreshCcw,
  SquareArrowOutUpRight,
} from "lucide-react";
import { prismaAccelerate } from "@/lib/prisma";
import { formatRupiah } from "@/helper/format-rupiah";
import CashIcon from "@/components/icons/cash-icon";
import NavButton from "@/components/nav-button";

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

  const [stats, recentOrders] = await Promise.all([
    getShopDashboardStats(session.user.shopId),
    getRecentOrdersByShop(session.user.shopId, 5),
  ]);

  const getUnpaidBillingTotals = await prismaAccelerate.shopBilling.aggregate({
    where: {
      shop_id: session.user.shopId,
      status: "UNPAID",
    },
    _sum: {
      total: true,
    },
  });

  return (
    <div className="space-y-5">
      <div className="mb-5">
        <h2 className="text-3xl font-medium tracking-tight">Dashboard</h2>
        <div className="text-lg text-muted-foreground">
          Ringkasan bisnis hari ini
        </div>
      </div>

      <DashboardStats stats={stats} />

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
              {formatRupiah(getUnpaidBillingTotals._sum.total || 0)}
            </h1>
          </div>
          <NavButton variant="outline" href={"/dashboard-kedai/tagihan"}>
            <SquareArrowOutUpRight /> Lihat Detail
          </NavButton>
        </CardContent>
      </Card>

      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="col-span-4 lg:col-span-1">
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
              <CardDescription>
                Kelola komplain dan pengembalian.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Link href="/dashboard-kedai/komplain" passHref>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquareWarning className="mr-2 h-4 w-4" />
                  Komplain Pelanggan
                </Button>
              </Link>
              <Link href="/dashboard-kedai/refund" passHref>
                <Button className="w-full justify-start" variant="outline">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Pengajuan Refund
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
