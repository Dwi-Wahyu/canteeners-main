import Link from "next/link";
import {
  CheckCircle2,
  MessageSquare,
  Smartphone,
  Zap,
  Store,
  Users2,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LandingTopbar from "@/components/layouts/landing-topbar";
import LandingFooter from "@/components/layouts/landing-footer";
import { CanteenFocusList } from "@/features/canteen/ui/canteen-focus-list";
import { cloneElement } from "react";
import { getJoinedShops } from "@/features/canteen/lib/mitra-queries";
import Image from "next/image";
import { getImageUrl } from "@/helper/get-image-url";

export default async function MitraRegistrationPage() {
  const canteens = [
    {
      id: 1,
      name: "Kantin Kudapan",
      image_url: "canteens/kudapan.webp",
      slug: "kantin-kudapan",
      estimated_visitors: 850,
    },
    {
      id: 2,
      name: "Kantin Sastra",
      image_url: "canteens/kansas.jpeg",
      slug: "kantin-sastra",
      estimated_visitors: 620,
    },
    {
      id: 3,
      name: "Kantin Sosiologi",
      image_url: "canteens/kansos.webp",
      slug: "kantin-sosiologi",
      estimated_visitors: 480,
    },
  ];

  const shops = await getJoinedShops();

  return (
    <div className="flex flex-col min-h-screen">
      <LandingTopbar />

      {/* Hero Section */}
      <section className="py-16 min-h-svh flex flex-col justify-center px-6 md:py-24 bg-primary/5">
        <div className="max-w-6xl mx-auto text-start md:text-center space-y-4">
          <Badge className="bg-primary text-primary-foreground">
            Mitra Canteeners
          </Badge>
          <h1 className="text-5xl font-medium tracking-tight text-foreground leading-tight">
            Digitalkan Kedai Anda di{" "}
            <span className="text-primary">Universitas Hasanuddin</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Bergabunglah dengan ekosistem digital kantin terbesar di Unhas.
            Kelola menu, pantau pesanan, dan tingkatkan penjualan tanpa ribet.
          </p>
          <div className="flex md:justify-center gap-4 pt-4">
            <Button asChild size="lg" className="rounded-full px-8 shadow-lg">
              <a
                href="https://wa.me/6289643144013?text=Saya%20ingin%20mendaftarkan%20kedai%20saya"
                target="_blank"
              >
                Daftar Sekarang
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8"
              asChild
            >
              <Link href="/syarat-dan-ketentuan/mitra">Syarat & Ketentuan</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Keunggulan Section - Kini mencakup poin-poin yang dipindahkan */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-start space-y-4">
            <h2 className="text-3xl font-medium tracking-tight">
              Lebih Dari Sekadar Aplikasi Pesan Antar
            </h2>
            <p className="text-muted-foreground">
              Fitur lengkap yang dirancang khusus untuk operasional kantin
              kampus.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard
              icon={<Zap />}
              title="Gratis Pendaftaran"
              desc="Tanpa biaya admin di awal. Kami hanya mengenakan biaya flat per item terjual."
            />
            <BenefitCard
              icon={<Users2 />}
              title="Potensi Trafik Tinggi"
              desc="Akses langsung ke ribuan mahasiswa yang berkunjung ke kantin setiap harinya."
            />
            <BenefitCard
              icon={<Store />}
              title="Ekosistem Terintegrasi"
              desc="Kedai Anda muncul otomatis pada pencarian berdasarkan lokasi kantin terdekat."
            />
            <BenefitCard
              icon={<MessageSquare />}
              title="Chat Real-time"
              desc="Berkomunikasi langsung dengan pelanggan untuk koordinasi pesanan yang lebih akurat."
            />
            <BenefitCard
              icon={<Smartphone />}
              title="Kelola Lewat HP"
              desc="Update stok menu dan terima notifikasi pesanan baru secara instan kapan saja."
            />
            <BenefitCard
              icon={<CheckCircle2 />}
              title="Komisi Adil"
              desc="Sistem komisi flat Rp1.000 per kuantitas item. Transparan tanpa potongan tersembunyi."
            />
          </div>
        </div>
      </section>

      {/* Market Section - Layout yang disederhanakan */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-4 md:gap-16">
          <div className="lg:sticky lg:top-32 lg:h-fit space-y-6">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight leading-tight">
              Hadir di Lokasi <br />
              <span className="text-primary">Paling Strategis</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Kami memprioritaskan digitalisasi pada kantin-kantin dengan volume
              pengunjung terpadat di Unhas. Pastikan kedai Anda siap melayani
              gelombang pelanggan digital.
            </p>
          </div>

          <div className="w-full">
            <div className="flex items-center gap-2 text-primary font-semibold uppercase tracking-wider text-sm">
              <MapPin className="w-4 h-4" />
              Titik Implementasi Awal
            </div>
            <CanteenFocusList data={canteens} />
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-start md:text-center space-y-4">
            <h2 className="text-3xl font-medium tracking-tight">
              Telah Bergabung Bersama Kami
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Bergabunglah dengan puluhan pemilik kedai lainnya yang telah
              mendigitalisasi bisnis mereka di Canteeners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops.map((shop, idx) => (
              <Card
                key={idx}
                className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={getImageUrl(shop.image_url)}
                    alt={shop.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90">
                      <Star className="w-3 h-3 text-primary fill-primary mr-1" />
                      {shop.average_rating.toFixed(1)} ({shop.total_ratings}){" "}
                    </Badge>
                  </div>
                </div>
                <CardContent>
                  <h3 className="font-bold text-lg line-clamp-1">
                    {shop.name}
                  </h3>{" "}
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{shop.canteen.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {shop.description ||
                      "Menyediakan hidangan terbaik untuk mahasiswa Unhas."}{" "}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <Card className="max-w-4xl p-7 mx-auto bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute -top-10 -right-10 opacity-10">
            <Store className="w-40 h-40" />
          </div>
          <CardHeader className="text-center space-y-4 relative z-10">
            <CardTitle className="text-3xl md:text-4xl font-semibold">
              Siap Bergabung?
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Hubungi admin kami untuk proses verifikasi dan aktivasi kedai
              Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 relative z-10">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-full px-12 py-7 text-lg font-semibold"
            >
              <a
                href="https://wa.me/6289643144013?text=Halo%20Admin%2C%20saya%20tertarik%20mendaftarkan%20kedai%20saya"
                target="_blank"
              >
                Hubungi via Whatsapp
              </a>
            </Button>
            <p className="text-xs opacity-70 italic text-center">
              *Dengan mendaftar, Anda menyetujui Syarat & Ketentuan Mitra
              Canteeners.
            </p>
          </CardContent>
        </Card>
      </section>

      <LandingFooter />
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactElement;
  title: string;
  desc: string;
}) {
  return (
    <Card className="border-none shadow-none bg-background transition-all hover:translate-y-1 group">
      <CardContent>
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
          {/* Perbaikan di baris bawah ini: Menggunakan React.cloneElement */}
          {cloneElement(icon, {
            className: "w-6 h-6",
          } as React.HTMLAttributes<SVGElement>)}
        </div>

        <CardTitle className="text-xl group-hover:text-primary">
          {title}
        </CardTitle>

        <p className="text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}
