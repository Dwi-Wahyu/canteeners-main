import { auth } from "@/config/auth";
import ShopOrderTrackingClient from "./shop-order-tracking-client";
import { redirect } from "next/navigation";
import { getOrderTrackingData } from "@/features/order/lib/order-queries";
import NavButton from "@/components/nav-button";
import { ChevronLeft, History } from "lucide-react";
import Link from "next/link";

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
      <div className="flex justify-between items-center mb-4">
        <Link
          href={"/dashboard-kedai"}
          className="flex gap-1 text-muted-foreground text-sm items-center"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali
        </Link>

        <NavButton
          href="/dashboard-kedai/order/riwayat"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
        >
          <History />
          Riwayat
        </NavButton>
      </div>

      <div className="mb-5">
        <h2 className="text-2xl font-medium tracking-tight">Order Tracking</h2>
        <div className=" text-muted-foreground text-sm">
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
