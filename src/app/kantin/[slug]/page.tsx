import { notFound } from "next/navigation";
import CanteenClient from "../../../features/canteen/ui/canteen-client";
import { getCanteenBySlug } from "@/features/canteen/lib/canteen-queries";
import { SearchParams } from "nuqs";
import { ShopSearchParams } from "@/features/shop/types/shop-search-params";
import { BottomNav } from "@/components/layouts/bottom-nav";
import { getCategories } from "@/features/category/lib/category-queries";

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

  const [canteen, categories] = await Promise.all([
    getCanteenBySlug(slug, search),
    getCategories(),
  ]);

  if (!canteen) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <CanteenClient canteen={canteen} categories={categories} />

      <BottomNav />
    </div>
  );
}
