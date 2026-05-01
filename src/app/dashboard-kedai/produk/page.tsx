import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import UnauthorizedPage from "@/components/pages/unauthorized-page";
import ProductClientPage from "@/app/dashboard-kedai/produk/client";
import { SearchParams } from "nuqs";
import { getShopProducts } from "@/features/product/lib/product-queries";
import { ProductSearchParams } from "@/features/product/types/product-search-params";
import { getCategories } from "@/features/category/lib/category-queries";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ProductPage({ searchParams }: IndexPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // handle ketika belum ada shop id
  if (!session.user.shopId) {
    return <UnauthorizedPage />;
  }

  if (session.user.role !== "SHOP_OWNER") {
    return <UnauthorizedPage />;
  }

  const search = await ProductSearchParams.parse(searchParams);

  const [products, categories] = await Promise.all([
    getShopProducts(session.user.shopId, {
      name: search.name,
      categoryId: search.categoryId,
      isAvailable: search.isAvailable,
      sortBy: search.sortBy,
    }),
    getCategories(),
  ]);

  return <ProductClientPage data={products} categories={categories} />;
}
