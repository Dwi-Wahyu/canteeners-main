import LandingTopbar from "@/components/layouts/landing-topbar";
import { auth } from "@/config/auth";
import AppTestimonyForm from "@/features/testimony/ui/app-testimony-form";

export default async function TestimonyPage() {
  const session = await auth();

  return (
    <div className="">
      <LandingTopbar />

      <div className="p-5 pt-28">
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
