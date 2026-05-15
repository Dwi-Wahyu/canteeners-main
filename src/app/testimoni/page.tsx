import LandingTopbar from "@/components/layouts/landing-topbar";
import { auth } from "@/config/auth";
import AppTestimonyForm from "@/features/testimony/ui/app-testimony-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      <div className="p-5 pt-28 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link href={finalBackUrl}>
              <ChevronLeft className="size-6" />
            </Link>
          </Button>
          <h1 className="text-lg font-bold">Kembali</h1>
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
