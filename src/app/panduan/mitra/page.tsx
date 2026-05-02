"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  ClipboardList,
  Wallet,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  UserCircle,
  RefreshCw,
  Zap,
  PackagePlus,
  CircleDollarSign,
  Settings2,
  Star,
  History,
  FileText,
} from "lucide-react";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function PanduanMitraPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("back_url") || "/";

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    { id: "profil", label: "Status & Profil", icon: <Store size={18} /> },
    {
      id: "produk",
      label: "Manajemen Produk",
      icon: <UtensilsCrossed size={18} />,
    },
    {
      id: "pesanan",
      label: "Manajemen Pesanan",
      icon: <ClipboardList size={18} />,
    },
    {
      id: "keuangan",
      label: "Komisi Platform",
      icon: <Wallet size={18} />,
    },

    {
      id: "interaksi",
      label: "Interaksi Pelanggan",
      icon: <MessageSquare size={18} />,
    },
    {
      id: "kendala",
      label: "Penanganan Kendala",
      icon: <AlertCircle size={18} />,
    },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const topbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - topbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <TopbarWithBackButton
        title="Panduan Mitra"
        backUrl={backUrl}
        actionButton={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hover:bg-accent"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        }
      />

      {/* Navigation Menu Dropdown */}
      <div
        className={cn(
          "fixed top-[60px] left-0 w-full bg-background border-b z-50 shadow-lg transition-all duration-300 ease-in-out transform origin-top",
          isMenuOpen
            ? "scale-y-100 opacity-100"
            : "scale-y-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-primary">{item.icon}</div>
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Overlay to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <main className="max-w-4xl mx-auto px-5 pt-24 space-y-8">
        {/* Hero Section */}
        <section id="dashboard" className="space-y-2 scroll-mt-24">
          <Badge variant="secondary" className="px-3 py-1">
            Mitra Kantiners
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Panduan Mitra
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Kelola pesanan, atur menu, dan pantau pendapatan bisnismu dengan
            lebih mudah dan efisien melalui Dashboard Kedai.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-primary/10 text-primary rounded-full">
                    <UserCircle size={20} />
                  </div>
                  <CardTitle className="text-lg">Akses Masuk (Login)</CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  Gunakan email dan kata sandi yang telah didaftarkan oleh
                  admin. Pastikan login melalui portal khusus Mitra/Kedai.
                </p>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-green-500/10 text-green-600 rounded-full">
                    <LayoutDashboard size={20} />
                  </div>
                  <CardTitle className="text-lg">Ringkasan Performa</CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  Pantau performa harian secara real-time: pesanan aktif,
                  pendapatan, komplain, dan tagihan komisi di halaman utama.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 2. Pengaturan Status & Profil */}
        <section id="profil" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Status & Profil Kedai
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-orange-500/10 text-orange-600 rounded-full">
                    <RefreshCw size={20} />
                  </div>
                  <CardTitle className="text-lg text-sm sm:text-base">
                    Buka/Tutup
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-xs">
                  Ubah status operasional melalui switch di pojok atas. Jangan
                  lupa tutup jika stok habis atau sedang libur.
                </p>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-blue-500/10 text-blue-600 rounded-full">
                    <Zap size={20} />
                  </div>
                  <CardTitle className="text-lg text-sm sm:text-base">
                    Auto-Accept
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-xs">
                  Aktifkan fitur ini agar pesanan masuk langsung berpindah ke
                  status "Sedang Diproses" tanpa konfirmasi manual.
                </p>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-purple-500/10 text-purple-600 rounded-full">
                    <Store size={20} />
                  </div>
                  <CardTitle className="text-lg text-sm sm:text-base">
                    Edit Spesialisasi
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-xs">
                  Update foto banner dan atur spesialisasi kedai (misal:
                  "Gorengan", "Ayam Geprek") agar lebih mudah ditemukan.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. Manajemen Produk */}
        <section id="produk" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Manajemen Produk (Menu)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-full">
                    <PackagePlus size={20} />
                  </div>
                  <CardTitle className="text-lg text-sm sm:text-base">
                    Kelola Menu
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-xs">
                  Tambah produk baru dengan foto menarik. Matikan status aktif
                  jika stok kosong untuk menyembunyikan menu dari pelanggan.
                </p>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-full">
                    <CircleDollarSign size={20} />
                  </div>
                  <CardTitle className="text-lg text-sm sm:text-base">
                    Harga & Modal
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-xs">
                  Masukkan Harga Jual dan Harga Modal. Sistem akan menghitung
                  estimasi margin keuntungan bersih secara otomatis.
                </p>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-amber-500/10 text-amber-600 rounded-full">
                    <Settings2 size={20} />
                  </div>
                  <CardTitle className="text-lg text-sm sm:text-base">
                    Varian & Opsi
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-xs">
                  Atur pilihan tambahan (Level Pedas, Topping). Pilih tipe "Satu
                  Pilihan" atau "Banyak" dan tentukan harga tambahan jika ada.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4. Alur Pesanan */}
        <section id="pesanan" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Alur Status Pesanan
            </h3>
          </div>

          <div className="relative pl-10 space-y-8 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
            {[
              {
                label: "Pesanan Baru",
                desc: "Pesanan masuk. Tekan 'Terima' atau 'Tolak' (jika bahan habis).",
                icon: <Clock className="size-4" />,
                color: "bg-orange-500",
              },
              {
                label: "Menunggu Cek Pembayaran",
                desc: "Verifikasi bukti transfer/QRIS pelanggan sebelum menekan konfirmasi.",
                icon: <CircleDollarSign className="size-4" />,
                color: "bg-blue-500",
              },
              {
                label: "Sedang Diproses",
                desc: "Waktunya memasak! Sistem akan menghitung mundur estimasi waktu pembuatan.",
                icon: <UtensilsCrossed className="size-4" />,
                color: "bg-yellow-500",
              },
              {
                label: "Selesai",
                desc: "Pesanan telah diambil atau diantar. Pendapatan otomatis tercatat.",
                icon: <CheckCircle2 className="size-4" />,
                color: "bg-green-500",
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div
                  className={`absolute -left-10 top-0 w-10 h-10 ${step.color} text-white rounded-full flex items-center justify-center z-10 shadow-sm border-4 border-background`}
                >
                  {step.icon}
                </div>
                <div className="pt-2 pl-2">
                  <h5 className="font-bold text-sm leading-tight">
                    {step.label}
                  </h5>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Keuangan */}
        <section id="keuangan" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Komisi Platform
            </h3>
          </div>

          <Card className="card-shadow">
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Skema Komisi</CardTitle>
                  <CardDescription>
                    Sistem pemotongan komisi yang transparan untuk setiap
                    pesanan yang berhasil.
                  </CardDescription>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <CircleDollarSign size={16} className="text-primary" />
                  Transparansi Biaya
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Setiap pesanan dikenakan biaya layanan (komisi) berdasarkan
                  jumlah item. Anda dapat memantau detail potongan, subsidi
                  platform, dan penyesuaian refund secara real-time.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 border rounded-lg bg-background">
                  <History size={16} className="text-primary mb-2" />
                  <h5 className="font-bold text-xs uppercase tracking-wider">
                    Tagihan Mingguan
                  </h5>
                  <p className="text-[10px] text-muted-foreground">
                    Lihat rekapitulasi komisi dan subsidi di menu Tagihan.
                  </p>
                </div>
                <div className="p-3 border rounded-lg bg-background">
                  <Star size={16} className="text-yellow-500 mb-2" />
                  <h5 className="font-bold text-xs uppercase tracking-wider">
                    Subsidi Voucher
                  </h5>
                  <p className="text-[10px] text-muted-foreground">
                    Platform menanggung potongan harga untuk voucher tertentu.
                  </p>
                </div>
              </div>

              <Button
                className="w-full group"
                onClick={() =>
                  (window.location.href =
                    "/panduan/mitra/komisi?back_url=/panduan/mitra")
                }
              >
                Pelajari Detail Komisi & Billing
                <ChevronRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* 6. Interaksi & Ulasan */}
        <section id="interaksi" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Interaksi & Ulasan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-green-500/10 text-green-600 rounded-full">
                    <MessageSquare size={20} />
                  </div>
                  <CardTitle className="text-lg">Chat & Quick Chat</CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  Gunakan Fitur Chat untuk catatan khusus dan buat template{" "}
                  <strong>Quick Chat</strong> (balasan cepat) untuk efisiensi
                  saat sibuk.
                </p>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-yellow-500/10 text-yellow-600 rounded-full">
                    <Star size={20} />
                  </div>
                  <CardTitle className="text-lg">Ulasan Pelanggan</CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  Pantau rating bintang dan ulasan. Respon yang baik dan
                  kualitas makanan akan menaikkan reputasi kedai Anda.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 7. Penanganan Kendala */}
        <section id="kendala" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Penanganan Kendala
            </h3>
          </div>

          <Card className="card-shadow border-destructive/20">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-destructive">
                <AlertCircle size={24} />
                <CardTitle className="text-lg">Komplain & Refund</CardTitle>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h5 className="font-bold text-sm">Menangani Komplain</h5>
                  <p className="text-xs text-muted-foreground">
                    Ubah status komplain menjadi <strong>Ditinjau</strong>,{" "}
                    <strong>Terselesaikan</strong>, atau{" "}
                    <strong>Ditolak</strong> melalui sistem jika pesanan
                    tertukar atau terlambat.
                  </p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-bold text-sm">Proses Refund</h5>
                  <p className="text-xs text-muted-foreground">
                    Jika menu tidak tersedia tapi sudah dibayar, pelanggan
                    berhak meminta Refund. Tinjau bukti dan lakukan pengembalian
                    dana jika valid.
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full mt-2 gap-2"
                    asChild
                  >
                    <Link
                      href={`/panduan/mitra/refund?back_url=/panduan/mitra?back_url=${encodeURIComponent(
                        backUrl,
                      )}`}
                    >
                      <FileText size={14} />
                      Baca Lengkap Panduan Refund
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                <p className="text-[11px] text-orange-800 italic font-medium">
                  <strong>Eskalasi:</strong> Jika terjadi perdebatan yang tidak
                  menemui titik temu, kasus dapat di-Eskalasi ke Admin sebagai
                  penengah.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer CTA */}
        <Separator className="my-10" />
        <section className="text-center pb-10 space-y-6">
          <div className="space-y-2">
            <h4 className="font-bold flex items-center justify-center gap-2">
              <ShieldCheck className="text-primary" />
              Keamanan Akun
            </h4>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Ubah kata sandi secara berkala di menu Profil dan pantau daftar
              perangkat yang sedang login.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Badge
              variant="outline"
              className="px-4 py-2 cursor-pointer hover:bg-secondary justify-center"
            >
              Pusat Bantuan Mitra
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-2 cursor-pointer hover:bg-secondary justify-center"
            >
              Hubungi Admin/CS
            </Badge>
          </div>
        </section>
      </main>
    </div>
  );
}
