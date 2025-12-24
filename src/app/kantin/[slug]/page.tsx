import { notFound } from "next/navigation";
import CanteenClient from "../../../features/canteen/ui/canteen-client";
import { getCanteenBySlug } from "@/features/canteen/lib/canteen-queries";
import { getCategories } from "@/features/category/lib/category-queries";
import { SearchParams } from "nuqs";
import { ShopSearchParams } from "@/features/shop/types/shop-search-params";
import LandingTopbar from "@/components/layouts/landing-topbar";
import { auth } from "@/config/auth";

export const dynamic = "force-dynamic";

export default async function CanteenDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const search = await ShopSearchParams.parse(searchParams);

  const validSlug = ["kantin-kudapan", "kantin-sosiologi", "kantin-sastra"];

  if (!slug.trim() || !validSlug.includes(slug)) {
    return notFound();
  }

  const canteen = await getCanteenBySlug(slug, search);

  if (!canteen) {
    return notFound();
  }

  const session = await auth();

  const categories = await getCategories();

  return (
    <div>
      <LandingTopbar />

      <div className="mt-20">
        <CanteenClient
          canteen={canteen}
          categories={categories}
          cart_id={session?.user?.cartId}
        />
      </div>
    </div>
  );
}
