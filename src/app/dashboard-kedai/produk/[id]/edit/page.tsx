import NotFoundResource from "@/components/pages/not-found-resource";
import EditProductForm from "@/app/dashboard-kedai/produk/[id]/edit/form";
import { Card, CardContent } from "@/components/ui/card";
import { getCategories } from "@/features/category/lib/category-queries";
import { getProductIncludeCategory } from "@/features/product/lib/product-queries";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProductIncludeCategory(id);

  if (!product) {
    return <NotFoundResource />;
  }

  const categories = await getCategories();

  return (
    <div>
      <TopbarWithBackButton
        title="Edit Produk"
        backUrl="/dashboard-kedai/produk"
      />

      <div className="p-5 pt-20">
        <EditProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
