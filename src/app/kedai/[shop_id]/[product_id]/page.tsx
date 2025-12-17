import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { auth } from "@/config/auth";
import { getProductById } from "@/features/product/lib/product-queries";
import GuestProductDetail from "@/features/product/ui/guest-product-detail";
import { notFound } from "next/navigation";

export default async function GuestProductDetailPage({
  params,
}: {
  params: Promise<{ product_id: string }>;
}) {
  const { product_id } = await params;

  const session = await auth();

  const data = await getProductById(product_id);

  if (!data) {
    return notFound();
  }

  return (
    <div className="pt-16">
      <TopbarWithBackButton
        title="Detail Produk"
        backUrl={"/kedai/" + data.shop_id}
      />

      <GuestProductDetail data={data} cartId={session?.user.cartId} />
    </div>
  );
}
