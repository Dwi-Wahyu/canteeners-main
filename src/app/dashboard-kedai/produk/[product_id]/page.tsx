import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import CustomerProductDetail from "./shop-product-detail-client";
import { getProductById } from "@/features/product/lib/product-queries";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ product_id: string }>;
}) {
  const { product_id } = await params;

  const data = await getProductById(product_id);

  if (!data) {
    return notFound();
  }

  return (
    <div>
      <TopbarWithBackButton
        title="Detail Produk"
        backUrl="/dashboard-kedai/produk"
      />

      <div className="p-5 pt-24">
        <CustomerProductDetail data={data} />
      </div>
    </div>
  );
}
