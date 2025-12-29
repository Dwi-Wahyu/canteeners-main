import { auth } from "@/config/auth";
import { getShopRefunds } from "@/features/shop/refund/lib/refund-queries";
import { redirect } from "next/navigation";
import { RefundList } from "@/features/shop/refund/ui/refund-list";
import { SearchParams } from "nuqs";
import { RefundSearchParams } from "@/features/shop/refund/types/refund-search-params";

export default async function ShopRefundListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login-kedai");
  }

  if (!session.user.shopId) {
    redirect("/login-kedai");
  }

  const search = await RefundSearchParams.parse(searchParams);

  const refunds = await getShopRefunds(session.user.shopId, search.status);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-medium tracking-tight">Daftar Refund</h2>
        <div className="text-muted-foreground">
          Kelola semua permintaan refund dari customer
        </div>
      </div>

      <RefundList refunds={refunds} />
    </div>
  );
}
