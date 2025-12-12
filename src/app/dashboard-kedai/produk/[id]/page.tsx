import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import ProductDetailClient from "../../../../features/product/ui/product-detail-client";
import NotFoundResource from "@/components/pages/not-found-resource";
import { getProductById } from "@/features/product/lib/product-queries";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await getProductById(id);

  if (!data) {
    return <NotFoundResource />;
  }

  return (
    <div>
      <TopbarWithBackButton
        title="Detail Produk"
        backUrl="/dashboard-kedai/produk"
      />

      <div className="p-5 pt-24">
        <ProductDetailClient data={data} />
      </div>
    </div>
  );
}
