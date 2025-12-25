import { auth } from "@/config/auth";
import ShopOrderTrackingClient from "./shop-order-tracking-client";
import { redirect } from "next/navigation";
import { getOrderTrackingData } from "@/features/order/lib/order-queries";

export default async function ShopOrderTrackingPage() {
  const session = await auth();

  if (!session) {
    redirect("/login-kedai");
  }

  if (!session.user.shopId) {
    redirect("/login-kedai");
  }

  const initialData = await getOrderTrackingData({
    shopId: session.user.shopId,
  });

  return (
    <div className="space-y-5">
      <div className="mb-5">
        <h2 className="text-2xl font-medium tracking-tight">Order Tracking</h2>
        <div className=" text-muted-foreground">
          Lihat daftar pesanan aktif dan pantau estimasi waktu pengerjaan
        </div>
      </div>

      <ShopOrderTrackingClient
        shopId={session.user.shopId}
        initialData={initialData}
      />
    </div>
  );
}
