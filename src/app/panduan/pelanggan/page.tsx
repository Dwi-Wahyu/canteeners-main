"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import {
  Search,
  QrCode,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Star,
  Clock,
  CheckCircle2,
  UtensilsCrossed,
  MapPin,
  Settings2,
  Receipt,
  Menu,
  X,
  ChevronRight,
  DollarSign,
  Users,
  Ticket,
} from "lucide-react";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function PanduanPelangganContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("back_url") || "/";

  const menuItems = [
    { id: "hero", label: "Beranda", icon: <MapPin size={18} /> },
    { id: "pencarian", label: "Pencarian & Order", icon: <Search size={18} /> },
    {
      id: "keranjang",
      label: "Keranjang & Biaya",
      icon: <ShoppingCart size={18} />,
    },
    {
      id: "referral",
      label: "Sistem Referral",
      icon: <Users size={18} />,
    },
    {
      id: "pembayaran",
      label: "Metode Pembayaran",
      icon: <CreditCard size={18} />,
    },
    { id: "pelacakan", label: "Pelacakan Order", icon: <Clock size={18} /> },
    { id: "chat", label: "Fitur Chat", icon: <MessageSquare size={18} /> },
    { id: "fitur", label: "Rating & Ulasan", icon: <Star size={18} /> },
    {
      id: "refund",
      label: "Refund & Pengembalian",
      icon: <DollarSign size={18} />,
    },
  ];

  const scrollToSection = (id: string) => {
    if (id === "refund") {
      window.location.href =
        "/panduan/pelanggan/refund?back_url=/panduan/pelanggan";
      return;
    }
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
        title="Panduan Pelanggan"
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
          "fixed top-15 left-0 w-full bg-background border-b z-50 shadow-lg transition-all duration-300 ease-in-out transform origin-top",
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
        <section id="hero" className="space-y-2 scroll-mt-24">
          <Badge variant="secondary" className="px-3 py-1">
            Pelanggan Kantiners
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Cara Menggunakan Canteeners
          </h2>
          <p className="text-muted-foreground text-lg mx-auto">
            Temukan kemudahan memesan makanan di kantin kampus favoritmu dengan
            mengikuti panduan praktis berikut ini.
          </p>
        </section>

        {/* 1. Pencarian dan Pemesanan - Bento Grid Style */}
        <section id="pencarian" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Pencarian & Pemesanan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-blue-500/10 text-blue-600 rounded-full">
                    <Search size={20} />
                  </div>
                  <CardTitle className="text-lg">Cari Kantin & Kedai</CardTitle>
                </div>

                <p className="text-muted-foreground text-sm">
                  Jelajahi berbagai kantin di halaman utama. Pilih kedai untuk
                  melihat menu lezat yang tersedia. Pastikan status kedai{" "}
                  <Badge
                    variant="outline"
                    className="text-success border-success text-[10px] py-0"
                  >
                    Aktif (Buka)
                  </Badge>{" "}
                  sebelum memesan.
                </p>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-purple-500/10 text-purple-600 rounded-full">
                    <QrCode size={20} />
                  </div>
                  <CardTitle className="text-lg">Scan QR Code Meja</CardTitle>
                </div>

                <p className="text-muted-foreground text-sm">
                  Pesan langsung di tempat dengan memindai QR Code di meja.
                  Lokasi (lantai & nomor meja) akan terisi otomatis. Pilih tipe
                  pengiriman <strong>"Antar ke Meja"</strong> untuk kenyamanan
                  ekstra.
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 bg-orange-500/10 text-orange-600 rounded-full">
                    <Settings2 size={20} />
                  </div>
                  <CardTitle className="text-lg">Kustomisasi Pesanan</CardTitle>
                </div>

                <p className="text-muted-foreground text-sm">
                  Setiap menu memiliki pilihan tambahan (topping), pilihan wajib
                  (level pedas), dan kolom catatan khusus untuk instruksi
                  tambahan seperti "tanpa bawang goreng" atau "pisahkan sambal".
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 2. Keranjang dan Biaya Layanan */}
        <section id="keranjang" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Keranjang & Biaya Layanan
            </h3>
          </div>

          <Card className="card-shadow overflow-hidden">
            <CardContent className="space-y-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Fleksibilitas Keranjang
                </CardTitle>

                <CardDescription>
                  Anda bisa menambahkan produk dari beberapa kedai sekaligus ke
                  dalam satu keranjang belanja.
                </CardDescription>
              </div>

              <p className="text-sm text-muted-foreground">
                Meskipun produk bisa dari berbagai kedai, proses checkout dan
                pembayaran tetap dilakukan <strong>per kedai</strong>. Harga
                item akan terkunci saat masuk ke keranjang untuk melindungimu
                dari perubahan harga mendadak.
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="font-semibold text-sm">Skema Biaya Layanan</h4>
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground font-medium border-b text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Jumlah Item</th>
                        <th className="px-4 py-3">Biaya Dasar</th>
                        <th className="px-4 py-3">Diskon</th>
                        <th className="px-4 py-3 text-right">Total Biaya</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-4 py-3">1 Item</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          Rp1.000
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">0%</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          Rp1.000
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">2 Item</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          Rp2.000
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">0%</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          Rp2.000
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-primary font-medium">
                          3 Item
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          Rp3.000
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 hover:bg-green-100"
                          >
                            50%
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-primary text-base">
                          Rp1.500
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-primary font-medium">
                          4 Item
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          Rp4.000
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 hover:bg-green-100"
                          >
                            50%
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-primary text-base">
                          Rp2.000
                        </td>
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="px-4 py-3 font-medium">{">"} 4 Item</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          Rp1.000 / item
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 hover:bg-green-100"
                          >
                            50%
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-primary italic">
                          Hanya 50%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-muted-foreground italic text-center">
                  *Semakin banyak item dalam satu kedai, semakin besar
                  penghematan biaya layananmu!
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. Sistem Referral */}
        <section id="referral" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Sistem Referral
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="card-shadow border-primary/20">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <CardTitle className="text-lg">
                    Bagi Kode, Dapat Untung
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  Setelah Anda menyelesaikan <strong>2 pesanan</strong>, Anda
                  berhak mendapatkan kode referral unik. Bagikan kode ini ke
                  teman Anda yang belum pernah memesan di Canteeners yang telah
                  registrasi.
                </p>
              </CardContent>
            </Card>

            <Card className="card-shadow border-primary/20">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <CardTitle className="text-lg">Hadiah Voucher</CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  Setiap kali kode Anda digunakan minimal oleh{" "}
                  <strong>3 pelanggan baru</strong>, Anda akan otomatis
                  mendapatkan <strong>Voucher Cashback Rp10.000</strong> yang
                  bisa digunakan untuk pesanan berikutnya.
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 card-shadow">
              <CardContent>
                <div className="flex flex-row items-center gap-4 pb-2">
                  <CardTitle className="text-lg">
                    Cara Menggunakan Kode
                  </CardTitle>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Bagi pelanggan baru, Anda bisa menggunakan kode referral
                    teman Anda di halaman <strong>Keranjang (Checkout)</strong>:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>
                      Pilih menu dari kedai favoritmu dan masuk ke halaman
                      Keranjang.
                    </li>
                    <li>
                      Cari bagian <strong>"Punya Kode Referral?"</strong> di
                      bawah detail pesanan.
                    </li>
                    <li>
                      Masukkan kode referral temanmu dan klik{" "}
                      <strong>"Gunakan"</strong>.
                    </li>
                    <li>
                      Potongan atau keuntungan referral akan langsung diterapkan
                      pada pesanan pertamamu!
                    </li>
                  </ol>
                  <p className="text-[10px] italic">
                    *Kode referral hanya dapat digunakan satu kali untuk
                    pengguna yang belum pernah melakukan transaksi.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4. Pembayaran */}
        <section id="pembayaran" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">Pembayaran</h3>
          </div>

          <div className="space-y-6">
            <Card className="card-shadow">
              <CardContent>
                <div>
                  <CardTitle>Metode Pembayaran</CardTitle>

                  <CardDescription>
                    Mendukung pembayaran Tunai, QRIS, dan Transfer. Metode yang
                    tersedia dapat berbeda di setiap kedai.
                  </CardDescription>
                </div>
                <div className="grid mt-4 grid-cols-3 gap-4 text-center">
                  <div className="p-3 border rounded-lg space-y-1">
                    <div className="mx-auto w-8 h-8 text-primary">
                      <QrCode size={32} />
                    </div>
                    <span className="text-[10px] font-medium">QRIS</span>
                  </div>
                  <div className="p-3 border rounded-lg space-y-1">
                    <div className="mx-auto w-8 h-8 text-blue-600">
                      <CreditCard size={32} />
                    </div>
                    <span className="text-[10px] font-medium">Transfer</span>
                  </div>
                  <div className="p-3 border rounded-lg space-y-1">
                    <div className="mx-auto w-8 h-8 text-green-600">
                      <Receipt size={32} />
                    </div>
                    <span className="text-[10px] font-medium">Tunai</span>
                  </div>
                </div>
                <p className="mt-4 text-xs rounded-lg text-muted-foreground p-3 bg-blue-50 border-l-4 border-blue-400">
                  <strong>Penting:</strong> Untuk metode QRIS dan Transfer, Anda
                  wajib mengunggah foto bukti pembayaran yang sah melalui
                  aplikasi agar pesanan dapat segera diverifikasi oleh kedai.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="pelacakan" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Pelacakan Order
            </h3>
          </div>

          <div className="relative pl-10 space-y-8 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
            {[
              {
                label: "Menunggu Konfirmasi",
                desc: "Pesananmu sedang dikirim ke kedai.",
                icon: <Clock className="size-4" />,
                color: "bg-orange-500",
              },
              {
                label: "Menunggu Pembayaran",
                desc: "Selesaikan pembayaran untuk memproses pesanan.",
                icon: <CreditCard className="size-4" />,
                color: "bg-blue-500",
              },
              {
                label: "Verifikasi Pembayaran",
                desc: "Kedai sedang memeriksa bukti bayarmu.",
                icon: <Search className="size-4" />,
                color: "bg-purple-500",
              },
              {
                label: "Diproses",
                desc: "Makanan lezatmu sedang disiapkan!",
                icon: <UtensilsCrossed className="size-4" />,
                color: "bg-yellow-500",
              },
              {
                label: "Selesai",
                desc: "Selamat menikmati makananmu!",
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

        {/* 5. Fitur Chat */}
        <section id="chat" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Fitur Chat Langsung
            </h3>
          </div>

          <Card className="card-shadow">
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    Komunikasi Real-time
                  </CardTitle>
                  <CardDescription>
                    Ada kendala atau ingin bertanya? Anda dapat mengirim pesan
                    teks maupun gambar langsung ke pemilik kedai.
                  </CardDescription>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <div className="flex items-start gap-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Kebijakan Penyimpanan:</strong> Demi kenyamanan dan
                    efisiensi penyimpanan, riwayat pesan yang berusia lebih dari{" "}
                    <strong>1 bulan</strong> akan dihapus otomatis oleh sistem.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 6. Rating & Ulasan */}
        <section id="fitur" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Rating & Ulasan
            </h3>
          </div>

          <Card className="card-shadow">
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Berikan Feedback-mu</CardTitle>
                  <CardDescription>
                    Setelah pesanan selesai, jangan lupa berikan ulasan dan
                    rating bintang 1-5. Kontribusimu sangat berarti untuk
                    membantu kami menjaga kualitas layanan mitra kedai.
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 7. Refund & Pengembalian */}
        <section id="refund" className="space-y-4 scroll-mt-24">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Refund & Pengembalian
            </h3>
          </div>

          <Card className="card-shadow border-primary/20 bg-primary/5">
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    Dana Aman & Terjamin
                  </CardTitle>
                  <CardDescription>
                    Jika pesananmu bermasalah (rusak, salah, atau tidak datang),
                    kamu bisa mengajukan pengembalian dana (refund) dengan
                    mudah.
                  </CardDescription>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>Proses Transparan</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>Bantuan CS</span>
                </div>
              </div>

              <Button
                className="w-full group"
                onClick={() =>
                  (window.location.href =
                    "/panduan/pelanggan/refund?back_url=/panduan/pelanggan")
                }
              >
                Baca Panduan Refund Lengkap
                <ChevronRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Footer CTA */}
        <Separator className="my-10" />
        <section className="text-center pb-10">
          <p className="text-muted-foreground text-sm mb-4">
            Masih punya pertanyaan lainnya?
          </p>
          <div className="flex justify-center gap-4">
            <Badge
              variant="outline"
              className="px-4 py-2 cursor-pointer hover:bg-secondary"
            >
              FAQ Pelanggan
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-2 cursor-pointer hover:bg-secondary"
            >
              Hubungi Admin
            </Badge>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function PanduanPelangganPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Memuat...</div>}>
      <PanduanPelangganContent />
    </Suspense>
  );
}
