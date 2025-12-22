import { auth } from "@/config/auth";
import { getBillingById } from "@/features/shop/billing/lib/billing-queries";
import { redirect } from "next/navigation";
import { BillingDetail } from "@/features/shop/billing/ui/billing-detail";

export default async function BillingDetailPage({
  params,
}: {
  params: Promise<{ billing_id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login-kedai");
  }

  if (!session.user.shopId) {
    redirect("/login-kedai");
  }

  const { billing_id } = await params;
  const billing = await getBillingById(billing_id);

  // Verify billing belongs to the shop owner
  if (!billing || billing.shop_id !== session.user.shopId) {
    redirect("/dashboard-kedai/tagihan");
  }

  return (
    <div>
      <BillingDetail billing={billing} />
    </div>
  );
}
