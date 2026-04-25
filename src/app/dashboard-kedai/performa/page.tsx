import { auth } from "@/config/auth";
import { getShopDashboardStats } from "@/features/shop/lib/shop-queries";
import { getBestSellingProducts } from "@/features/product/lib/product-queries";
import { redirect } from "next/navigation";
import DashboardStats from "@/features/shop/ui/dashboard-stats";
import { ShopBestSellingProduct } from "@/features/product/ui/shop-best-selling-product";

export default async function PerformaKedaiPage() {
  const session = await auth();

  if (!session || !session.user.id || !session.user.shopId) {
    redirect("/login-kedai");
  }

  const [stats, bestSellerProducts] = await Promise.all([
    getShopDashboardStats(session.user.shopId),
    getBestSellingProducts(session.user.shopId, 5),
  ]);

  return (
    <div className="space-y-5">
      <div className="">
        <h2 className="text-2xl font-medium tracking-tight">Performa</h2>
        <div className="text-muted-foreground">
          Analisis performa bisnis Anda
        </div>
      </div>

      <DashboardStats stats={stats} />

      <ShopBestSellingProduct products={bestSellerProducts} />
    </div>
  );
}
