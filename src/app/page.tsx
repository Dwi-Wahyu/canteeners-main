import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  CircleAlertIcon,
  MessagesSquare,
  ShoppingBag,
  Store,
  TabletSmartphone,
  Video,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LandingTopbar from "@/components/layouts/landing-topbar";
import NavButton from "@/components/nav-button";
import { FeatureCard } from "@/components/feature-card";
import LandingFooter from "@/components/layouts/landing-footer";
import AppTestimonyList from "@/features/testimony/ui/app-testimony-list";

export default async function LandingPage() {
  return (
    <div>
      <LandingTopbar />

      <div
        id="hero"
        className="w-full h-svh p-5 bg-accent/20 pb-20 pt-32 flex justify-center items-start md:items-center  md:text-center flex-col gap-6"
      >
        <Badge className="rounded-full bg-accent text-accent-foreground">
          🎉 Platform Pemesanan Makanan Kampus #1
        </Badge>

        <h1 className="text-5xl">
          Pesan Makanan <span className="text-primary/80">Lebih Mudah</span> &{" "}
          <span className="text-primary">Cepat</span>
        </h1>

        <h1 className="text-muted-foreground text-lg">
          Canteeners menghubungkan kamu dengan kedai makanan favoritmu. Pesan,
          bayar, dan ambil tanpa antri!
        </h1>

        <div className="flex gap-4">
          <NavButton
            size={"lg"}
            href="/kantin/kantin-kudapan"
            variant="default"
          >
            <ShoppingBag />
            Mulai Pesan
          </NavButton>

          <NavButton size={"lg"} href="/mitra" variant="outline">
            <Store />
            Daftar Mitra
          </NavButton>
        </div>
      </div>

      <div className="w-full px-5 flex flex-col gap-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl mb-2">Fitur Unggulan</h1>
          <h1 className="text-muted-foreground text-lg">
            Platform lengkap untuk kebutuhan pemesanan makananmu
          </h1>
        </div>

        <FeatureCard
          icon={<TabletSmartphone />}
          title="Pesan Tanpa Aplikasi"
          description="Langsung pesan melalui browser, tidak perlu download aplikasi. Cepat dan praktis!"
        />

        <FeatureCard
          icon={<MessagesSquare />}
          title="Chat Langsung"
          description="Komunikasi langsung dengan pemilik kedai untuk request khusus atau pertanyaan"
        />

        <FeatureCard
          icon={<CheckCircle />}
          title="Real-time Tracking"
          description="Pantau status pesananmu secara real-time dari konfirmasi hingga siap diambil"
        />
      </div>

      <div className="w-full flex flex-col gap-6 px-5 py-20 bg-primary text-primary-foreground">
        <div>
          <h1 className="text-4xl mb-2">Bergabung Sebagai Mitra</h1>
          <h1 className="text-muted text-lg">
            Tingkatkan penjualan kedaimu dengan bergabung di Canteeners. Raih
            lebih banyak pelanggan dan kelola pesanan dengan mudah.
          </h1>
        </div>

        <div className="flex gap-2">
          <div className="p-1 h-fit rounded-full bg-primary-foreground text-primary">
            <CheckCircle />
          </div>
          <div>
            <h1>Gratis Pendaftaran</h1>
            <h1 className="text-muted">Tanpa biaya setup atau biaya bulanan</h1>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="p-1 h-fit rounded-full bg-primary-foreground text-primary">
            <CheckCircle />
          </div>
          <div>
            <h1>Dashboard Lengkap</h1>
            <h1 className="text-muted">Kelola menu, pesanan, dan penjualan</h1>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="p-1 h-fit rounded-full bg-primary-foreground text-primary">
            <CheckCircle />
          </div>
          <div>
            <h1>Support 24/7</h1>
            <h1 className="text-muted">Tim support siap membantu kapan saja</h1>
          </div>
        </div>

        <NavButton
          href="/mitra"
          className="w-fit text-primary dark:text-primary-foreground"
          size={"lg"}
          variant={"outline"}
        >
          <Store />
          Daftar Sekarang
        </NavButton>
      </div>

      <div className="w-full px-5 py-20 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-4xl mb-2">Cara Pesan</h1>
          <h1 className="text-muted-foreground text-lg">
            Mudah dan cepat, ikuti langkah-langkahnya!
          </h1>
        </div>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex gap-5 items-start">
            <div className="shrink-0 aspect-square size-10 rounded-full flex items-center justify-center bg-primary/20 text-primary font-bold border border-primary/30">
              1
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium leading-none">Pilih Kedai</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Pelanggan mencari dan memilih kedai Anda melalui daftar kantin
                yang tersedia di Unhas.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-5 items-start">
            <div className="shrink-0 aspect-square size-10 rounded-full flex items-center justify-center bg-primary/40 text-primary-foreground font-bold">
              2
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium leading-none">Pilih Menu</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Pelanggan memilih produk makanan atau minuman terbaik yang telah
                Anda upload di dashboard.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-5 items-start">
            <div className="shrink-0 aspect-square size-10 rounded-full flex items-center justify-center bg-primary/60 text-primary-foreground font-bold">
              3
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium leading-none">
                Tambah ke Keranjang
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Pesanan dimasukkan ke keranjang digital lengkap dengan catatan
                khusus dari pelanggan.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-5 items-start">
            <div className="shrink-0 aspect-square size-10 rounded-full flex items-center justify-center bg-primary/80 text-primary-foreground font-bold">
              4
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium leading-none">
                Pilih Meja & Mode
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Pelanggan menentukan nomor meja untuk makan di tempat atau
                memilih opsi bawa pulang.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-5 items-start">
            <div className="shrink-0 aspect-square size-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20">
              5
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium leading-none">
                Bayar & Terima Pesanan
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Transaksi diselesaikan secara digital dan Anda mendapatkan
                notifikasi pesanan masuk secara instan.
              </p>
            </div>
          </div>
        </div>

        {/* <div>
          <h1 className="text-lg font-medium">Tutorial Lengkap Cara Pesan</h1>

          <h1 className="text-muted-foreground">
            Tonton video ini untuk melihat step-by-step cara memesan makanan di
            Canteeners
          </h1>
        </div>

        <div className="h-48 w-full rounded-lg text-white bg-black flex justify-center items-center">
          <Video />
        </div> */}

        <Alert className="border-accent-foreground/20 from-accent text-accent-foreground flex justify-between bg-linear-to-b to-transparent to-60%">
          <CircleAlertIcon />
          <div className="flex flex-1 flex-col gap-1">
            <AlertTitle>Tips Pemesanan</AlertTitle>
            <AlertDescription className="text-accent-foreground/60">
              Periksa jam operasional kedai sebelum memesan
            </AlertDescription>
          </div>
        </Alert>
      </div>

      <AppTestimonyList />

      <div className="w-full flex flex-col gap-6 px-5 py-20 bg-primary text-primary-foreground">
        <div className="text-center">
          <h1 className="text-4xl mb-2">Siap Mulai Memesan?</h1>
          <h1 className="text-muted text-lg">
            Bergabunglah dengan ribuan pengguna lainnya yang sudah menikmati
            kemudahan Canteeners
          </h1>
        </div>

        <div className="flex flex-col items-center gap-4">
          <NavButton
            size={"lg"}
            href="/kantin/kantin-kudapan"
            variant="outline"
            className="text-primary"
          >
            <ShoppingBag />
            Mulai Pesan
          </NavButton>

          <NavButton
            size={"lg"}
            href="/mitra"
            variant="outline"
            className="text-primary"
          >
            <Store />
            Daftar Mitra
          </NavButton>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
