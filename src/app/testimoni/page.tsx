import LandingTopbar from "@/components/layouts/landing-topbar";
import { auth } from "@/config/auth";
import AppTestimonyForm from "@/features/testimony/ui/app-testimony-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import HistoryBackButton from "@/components/layouts/history-back-button";

export default async function TestimonyPage({
  searchParams,
}: {
  searchParams: Promise<{ back_url?: string }>;
}) {
  const session = await auth();
  const { back_url } = await searchParams;
  const finalBackUrl = back_url || "/";

  return (
    <div className="">
      <LandingTopbar />

      <div className="p-5 pt-24 max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <HistoryBackButton className="flex gap-1 items-center">
            <ChevronLeft className="w-4 h-4" /> Kembali
          </HistoryBackButton>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Kritik & Saran</h1>
          <p className="text-muted-foreground mt-2">
            Kami sangat menghargai masukan Anda untuk pengembangan{" "}
            <span className="font-medium text-primary">Canteeners</span> .
          </p>
        </div>
        <AppTestimonyForm
          defaultName={session?.user.name}
          defaultRole={
            session?.user.role === "SHOP_OWNER"
              ? "Pemilik Kedai"
              : session?.user.role === "CUSTOMER"
                ? "Pelanggan"
                : undefined
          }
        />
      </div>
    </div>
  );
}
