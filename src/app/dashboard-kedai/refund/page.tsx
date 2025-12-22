import { auth } from "@/config/auth";
import { getShopRefunds } from "@/features/shop/refund/lib/refund-queries";
import { redirect } from "next/navigation";
import { RefundList } from "@/features/shop/refund/ui/refund-list";

export default async function ShopRefundListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login-kedai");
  }

  const { status } = await searchParams;

  if (!session.user.shopId) {
    redirect("/login-kedai");
  }

  const refunds = await getShopRefunds(session.user.shopId, status as any);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-3xl font-medium tracking-tight">Daftar Refund</h2>
        <div className="text-lg text-muted-foreground">
          Kelola semua permintaan refund dari customer
        </div>
      </div>

      <RefundList refunds={refunds} />
    </div>
  );
}
