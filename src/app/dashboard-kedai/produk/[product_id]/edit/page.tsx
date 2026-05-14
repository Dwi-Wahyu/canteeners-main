import NotFoundResource from "@/components/pages/not-found-resource";
import EditProductForm from "@/app/dashboard-kedai/produk/[product_id]/edit/form";
import { getCategories } from "@/features/category/lib/category-queries";
import { getProductIncludeCategory } from "@/features/product/lib/product-queries";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ product_id: string; back_url?: string }>;
}) {
  const { product_id, back_url } = await params;

  const product = await getProductIncludeCategory(product_id);

  if (!product) {
    return <NotFoundResource />;
  }

  const categories = await getCategories();

  console.log(back_url);

  return (
    <div>
      <TopbarWithBackButton
        title="Edit Produk"
        backUrl={back_url || "/dashboard-kedai/produk"}
      />

      <div className="p-5 pt-20">
        <EditProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
