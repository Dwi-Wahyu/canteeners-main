import { auth } from "@/config/auth";
import {
  getShopDashboardStats,
  getShopRanking,
} from "@/features/shop/lib/shop-queries";
import { getBestSellingProducts } from "@/features/product/lib/product-queries";
import { redirect } from "next/navigation";
import DashboardStats from "@/features/shop/ui/dashboard-stats";
import { ShopBestSellingProduct } from "@/features/product/ui/shop-best-selling-product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import { unstable_cache } from "next/cache";

export default async function PerformaKedaiPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await auth();
  const { period = "today" } = await searchParams;

  if (!session || !session.user.id || !session.user.shopId) {
    redirect("/login-kedai");
  }

  const shopId = session.user.shopId;

  const [stats, bestSellerProducts, ranking] = await Promise.all([
    unstable_cache(
      async () =>
        getShopDashboardStats(
          shopId,
          period as "today" | "week" | "month" | "all",
        ),
      ["shop-dashboard-stats", shopId, period],
      {
        revalidate: 3600,
        tags: ["orders", `shop-stats-${shopId}`],
      },
    )(),
    unstable_cache(
      async () => getBestSellingProducts(shopId, 5),
      ["best-selling-products", shopId],
      {
        revalidate: 3600,
        tags: ["orders", `shop-products-${shopId}`],
      },
    )(),
    unstable_cache(async () => getShopRanking(shopId), ["shop-ranking", shopId], {
      revalidate: 3600,
      tags: ["orders", `shop-ranking-${shopId}`],
    })(),
  ]);

  return (
    <div className="space-y-5">
      <div className="">
        <h2 className="text-2xl font-medium tracking-tight">Performa</h2>
        <div className="text-muted-foreground">
          Analisis performa bisnis Anda
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Peringkat Kedai
            </CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {ranking.rank ? (
              <div className="flex flex-col gap-1">
                <div className="text-2xl font-bold">#{ranking.rank}</div>
                <p className="text-xs text-muted-foreground">
                  Dari {ranking.totalShops} kedai aktif minggu ini
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                  <TrendingUp className="h-3 w-3" />
                  {ranking.orderCount} pesanan selesai
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="text-lg font-medium text-muted-foreground">
                  Belum Berperingkat
                </div>
                <p className="text-xs text-muted-foreground">
                  Selesaikan pesanan pertama Anda minggu ini untuk masuk
                  peringkat
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <DashboardStats
            stats={stats}
            period={period as "today" | "week" | "month" | "all"}
          />
        </div>
      </div>

      <ShopBestSellingProduct products={bestSellerProducts} />
    </div>
  );
}
