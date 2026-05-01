"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Info,
  CheckCircle2,
  Star,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "nextjs-toploader/app";

export default function AppVersionPage() {
  const version = "1.0.0";
  const router = useRouter();

  const features = [
    {
      title: "Pemesanan Real-Time",
      description: "Pesan makanan dari kantin favorit Anda tanpa antre lama.",
      icon: <Zap className="size-5 text-orange-500" />,
    },
    {
      title: "Sistem Referral",
      description: "Bagikan kode unik Anda dan dapatkan diskon menarik.",
      icon: <Star className="size-5 text-yellow-500" />,
    },
    {
      title: "Manajemen Toko Lengkap",
      description:
        "Dashboard intuitif untuk pemilik kedai mengelola produk dan pesanan.",
      icon: <CheckCircle2 className="size-5 text-green-500" />,
    },
    {
      title: "Keamanan Terjamin",
      description:
        "Sistem autentikasi dan otorisasi yang aman untuk semua pengguna.",
      icon: <ShieldCheck className="size-5 text-blue-500" />,
    },
  ];

  function handleBack() {
    router.back();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-12">
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <button
          onClick={() => handleBack()}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-red-600 mb-6 transition-colors"
        >
          <ChevronLeft className="size-4 mr-1" />
          Kembali
        </button>

        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative size-32 mb-4 drop-shadow-md">
            <Image
              src="/logo.png"
              alt="Canteeners Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Canteeners
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <Badge
              variant="secondary"
              className="px-3 py-1 text-sm font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            >
              v{version}
            </Badge>
          </div>
          <p className="max-w-md text-muted-foreground">
            Platform pemesanan foodcourt real-time yang dirancang untuk
            kemudahan dan kenyamanan Anda dalam berkuliner.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Info className="size-5 text-red-600" />
                Apa yang Baru?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm overflow-hidden">
            <div className="h-1 bg-linear-to-r from-red-600 to-orange-500 w-full" />
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Pengembang</span>
                  <span className="font-medium">Canteeners Team</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-4 border-border/50">
                  <span className="text-muted-foreground">Lisensi</span>
                  <span className="font-medium">Proprietary</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-4 border-border/50">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-medium">Web App (React/Next.js)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <p className="text-[10px] text-muted-foreground mb-4 italic">
              "Lewati antrean, nikmati makananmu."
            </p>
            <div className="flex justify-center gap-4 text-xs font-medium text-muted-foreground">
              <Link
                href="/syarat-dan-ketentuan/mitra"
                className="hover:text-red-600 transition-colors"
              >
                Syarat & Ketentuan
              </Link>
              <span className="text-border">|</span>
              <Link
                href="/kebijakan-dan-privasi"
                className="hover:text-red-600 transition-colors"
              >
                Kebijakan Privasi
              </Link>
            </div>
            <p className="text-[10px] text-muted-foreground mt-6">
              © {new Date().getFullYear()} Canteeners App. Semua hak dilindungi
              undang-undang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
