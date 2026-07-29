import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import Link from "next/link";
import {
  ChevronRight,
  Store,
  UserCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | Canteeners",
  description:
    "Pusat informasi Syarat & Ketentuan Pelanggan, Kemitraan Kedai, serta Kebijakan Refund Canteeners.",
};

interface SyaratDanKetentuanPageProps {
  searchParams: Promise<{ back_url?: string }>;
}

export default async function SyaratDanKetentuanIndexPage({
  searchParams,
}: SyaratDanKetentuanPageProps) {
  const { back_url } = await searchParams;

  const buildUrl = (path: string) => {
    const parentBackUrl = back_url ? encodeURIComponent(back_url) : "";
    const currentPath = encodeURIComponent(
      parentBackUrl
        ? `/syarat-dan-ketentuan?back_url=${parentBackUrl}`
        : "/syarat-dan-ketentuan",
    );
    return `${path}?back_url=${currentPath}`;
  };

  const navItems = [
    {
      title: "Syarat & Ketentuan Pelanggan",
      description:
        "Aturan penggunaan platform, tata cara pemesanan, metode pembayaran, serta hak dan kewajiban bagi pelanggan Canteeners.",
      href: buildUrl("/syarat-dan-ketentuan/pelanggan"),
      badge: "Untuk Pelanggan",
      icon: UserCheck,
      color:
        "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      borderColor: "hover:border-blue-500/40",
    },
    {
      title: "Syarat & Ketentuan Kemitraan",
      description:
        "Ketentuan operasional, standar pelayanan, pembagian komisi, serta hak dan kewajiban bagi pemilik kedai (Mitra Canteeners).",
      href: buildUrl("/syarat-dan-ketentuan/mitra"),
      badge: "Untuk Mitra Kedai",
      icon: Store,
      color:
        "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      borderColor: "hover:border-emerald-500/40",
    },
    {
      title: "Kebijakan Refund & Pengembalian",
      description:
        "Panduan resmi pengajuan refund, kriteria pembatalan pesanan, serta mekanisme dan durasi pengembalian dana.",
      href: buildUrl("/syarat-dan-ketentuan/refund"),
      badge: "Kebijakan Refund",
      icon: RotateCcw,
      color:
        "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      borderColor: "hover:border-amber-500/40",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      <TopbarWithBackButton
        title="Syarat & Ketentuan"
        backUrl={back_url || "/"}
      />

      <div className="max-w-3xl mx-auto px-5 pt-24 space-y-8">
        <header className="space-y-3 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Syarat & Ketentuan
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Silakan pilih kategori dokumen di bawah ini untuk mempelajari
            ketentuan layanan, kebijakan kemitraan, atau panduan pengembalian
            dana di Canteeners.
          </p>
        </header>

        <main className="grid grid-cols-1 gap-4">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`group relative flex flex-col items-start justify-between p-5 bg-card rounded-2xl border transition-all duration-200 hover:shadow-md ${item.borderColor}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h2>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 ml-0 sm:ml-16 sm:mt-2 flex items-center justify-end w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                  <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Baca Selengkapnya
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </main>
      </div>
    </div>
  );
}
