import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { auth } from "@/config/auth";
import { notFound, redirect } from "next/navigation";
import ShopDashboardTestimonyClient from "./client";
import {
  getShopRatings,
  getShopTestimonies,
} from "@/features/shop/lib/shop-queries";

export default async function CustomerReviewsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login-kedai");
  }

  if (!session.user.shopId) {
    redirect("/login-kedai");
  }

  const shopRatings = await getShopRatings(session.user.shopId);

  if (!shopRatings) {
    return notFound();
  }

  const testimonies = await getShopTestimonies(session.user.shopId);

  return (
    <div>
      <TopbarWithBackButton
        title="Ulasan Pelanggan"
        backUrl="/dashboard-kedai/pengaturan"
      />

      <ShopDashboardTestimonyClient
        shopRatings={shopRatings}
        testimonies={testimonies}
      />
    </div>
  );
}
