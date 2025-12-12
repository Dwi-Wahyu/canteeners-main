import { auth } from "@/config/auth";
import { getCategories } from "@/features/category/lib/category-queries";
import UnauthorizedPage from "@/components/pages/unauthorized-page";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import CreateProductForm from "@/features/product/ui/create-product-form";

export default async function CreateProductPage() {
  const session = await auth();

  if (!session) {
    return <UnauthorizedPage />;
  }

  if (!session.user.shopId) {
    return <UnauthorizedPage />;
  }

  const categories = await getCategories();

  return (
    <div>
      <TopbarWithBackButton
        title="Tambah Produk"
        backUrl="/dashboard-kedai/produk"
      />

      <div className="p-5 pt-24">
        <CreateProductForm shop_id={session.user.shopId} categories={categories} />
      </div>
    </div>
  );
}
