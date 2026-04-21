import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import { getAllCategories, getShopSpecializations } from "@/features/shop/lib/shop-specialization-queries";
import { getShopById } from "@/features/shop/lib/shop-queries";
import ShopSpecializationForm from "@/features/shop/settings/ui/shop-specialization-form";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";

export default async function ShopSpecializationPage() {
  const session = await auth();

  if (!session || session.user.role !== "SHOP_OWNER") {
    redirect("/auth/signin");
  }

  if (!session.user.shopId) {
    return (
      <div className="p-5">
        <p>Kedai tidak ditemukan.</p>
      </div>
    );
  }

  const shop = await getShopById(session.user.shopId);

  if (!shop) {
    return (
      <div className="p-5">
        <p>Kedai tidak ditemukan.</p>
      </div>
    );
  }

  const allCategories = await getAllCategories();
  const currentSpecializations = await getShopSpecializations(shop.id);

  return (
    <div className="pb-20">
      <TopbarWithBackButton title="Spesialisasi Kedai" backUrl="/dashboard-kedai/pengaturan" />

      <div className="p-5 mt-16">
        <ShopSpecializationForm
          shopId={shop.id}
          allCategories={allCategories}
          currentSpecializations={currentSpecializations}
        />
      </div>
    </div>
  );
}
