import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import UnauthorizedPage from "@/components/pages/unauthorized-page";
import ProductClientPage from "@/app/dashboard-kedai/produk/client";
import { SearchParams } from "nuqs";
import { getShopProducts } from "@/features/product/lib/product-queries";
import { ProductSearchParams } from "@/features/product/types/product-search-params";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ProductPage({ searchParams }: IndexPageProps) {
  const session = await auth();
  const search = await ProductSearchParams.parse(searchParams);

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

  const products = await getShopProducts(session.user.shopId, search.name);

  return <ProductClientPage data={products} />;
}
