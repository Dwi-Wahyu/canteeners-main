import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import UnauthorizedPage from "@/components/pages/unauthorized-page";
import ProductClientPage from "@/features/product/ui/product-client-page";
import { SearchParams } from "nuqs";
import { getShopProducts } from "@/features/product/lib/product-queries";
import { productSearchParams } from "@/features/product/types/product-search-params";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ProductPage({ searchParams }: IndexPageProps) {
  const session = await auth();
  const search = await productSearchParams.parse(searchParams);

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

  const products = await getShopProducts(session.user.shopId, search.name)

  return <div>
    <ProductClientPage data={products} />
  </div>;
}
