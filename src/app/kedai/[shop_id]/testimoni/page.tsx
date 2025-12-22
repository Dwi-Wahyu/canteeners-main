import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { getShopTestimonies } from "@/features/shop/lib/shop-queries";
import ShopTestimonyDisplayClient from "@/features/shop/ui/shop-testimony-display-client";

export default async function ShopTestimonyDisplayPage({
  params,
}: {
  params: Promise<{ shop_id: string }>;
}) {
  const { shop_id } = await params;

  const shopTestimony = await getShopTestimonies(shop_id);

  return (
    <div className="p-5 pt-20">
      <TopbarWithBackButton
        title="Ulasan Kedai"
        backUrl={"/kedai/" + shop_id}
      />

      <ShopTestimonyDisplayClient data={shopTestimony} />
    </div>
  );
}
