import { auth } from "@/config/auth";
import { getShopBillings } from "@/features/shop/billing/lib/billing-queries";
import { redirect } from "next/navigation";
import { BillingList } from "@/features/shop/billing/ui/billing-list";
import { ShopBillingStatus } from "@/generated/prisma";

export default async function ShopBillingListPage({
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

  const billings = await getShopBillings(
    session.user.shopId,
    status === "all" || !status ? undefined : (status as ShopBillingStatus)
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-3xl font-medium tracking-tight">Daftar Tagihan</h2>
        <div className="text-lg text-muted-foreground">
          Lihat tagihan komisi untuk toko Anda
        </div>
      </div>

      <BillingList billings={billings} />
    </div>
  );
}
