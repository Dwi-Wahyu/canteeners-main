import { notFound, redirect } from "next/navigation";
import CanteenClient from "../../../features/canteen/ui/canteen-client";
import { getCanteenBySlug } from "@/features/canteen/lib/canteen-queries";
import { SearchParams } from "nuqs";
import { ShopSearchParams } from "@/features/shop/types/shop-search-params";
import { BottomNav } from "@/components/layouts/bottom-nav";
import { auth } from "@/config/auth";
import { CanteenAutoTableSync } from "@/features/canteen/ui/canteen-auto-table-sync";
import { CanteenCategoryFilter } from "@/features/canteen/ui/canteen-category-filter";
import { Suspense } from "react";

export default async function CanteenDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const search = await ShopSearchParams.parse(searchParams);

  const session = await auth();

  if (session && session.user.role === "SHOP_OWNER") {
    redirect("/dashboard-kedai");
  }

  const validSlug = ["kantin-kudapan", "kantin-sosiologi", "kantin-sastra"];

  if (!slug.trim() || !validSlug.includes(slug)) {
    return notFound();
  }

  const canteen = await getCanteenBySlug(slug, search);

  if (!canteen) {
    return notFound();
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f6faff" }}>
      <Suspense>
        <CanteenAutoTableSync session={session} canteenId={canteen.id} />

        <CanteenClient
          canteen={canteen}
          categoryFilter={<CanteenCategoryFilter />}
          session={session}
        />
      </Suspense>

      <BottomNav />
    </div>
  );
}
