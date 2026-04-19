import Link from "next/link";
import LandingTopbar from "@/components/layouts/landing-topbar";
import LandingFooter from "@/components/layouts/landing-footer";
import AnimateOnScroll from "@/components/animate-on-scroll";
import CanteenScrollSection from "@/components/canteen-scroll-section";
import { getJoinedShops } from "@/features/canteen/lib/mitra-queries";
import { getImageUrl } from "@/helper/get-image-url";
import { MapPin } from "lucide-react";


const benefits = [
  {
    icon: "trending_up",
    title: "Peningkatan Omzet",
    desc: "Akses ke ribuan mahasiswa dan staf kampus setiap harinya melalui aplikasi.",
  },
  {
    icon: "speed",
    title: "Operasional Efisien",
    desc: "Manajemen pesanan digital meminimalkan antrean dan pesanan terlewat.",
  },
  {
    icon: "payments",
    title: "Pembayaran Mudah",
    desc: "Sistem pembayaran terintegrasi, aman, dan pencairan dana yang cepat.",
  },
  {
    icon: "chat",
    title: "Chat Real-time",
    desc: "Berkomunikasi langsung dengan pelanggan untuk koordinasi pesanan yang lebih akurat.",
  },
  {
    icon: "phone_android",
    title: "Kelola Lewat HP",
    desc: "Update stok menu dan terima notifikasi pesanan baru secara instan kapan saja.",
  },
  {
    icon: "verified",
    title: "Komisi Adil",
    desc: "Sistem komisi flat Rp1.000 per kuantitas item. Transparan tanpa potongan tersembunyi.",
  },
];

export default async function MitraRegistrationPage() {
  const shops = await getJoinedShops();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff]">
      <LandingTopbar />

      {/* ── Hero Section ── */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80"
            alt="Dapur kantin profesional"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,28,48,0.45) 0%, rgba(11,28,48,0.82) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white pt-24 pb-16">
          <div
            className="inline-block py-1.5 px-5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-headline text-sm font-semibold mb-7 opacity-0 translate-y-6"
            style={{ animation: "heroFadeUp 0.7s 0.2s forwards ease-out" }}
          >
            Mitra Canteeners
          </div>

          <h1
            className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight opacity-0 translate-y-6"
            style={{ animation: "heroFadeUp 0.7s 0.4s forwards ease-out" }}
          >
            Jadilah Bagian dari{" "}
            <br />
            <span className="text-[#ffb4ab]">Revolusi Kantin</span>
          </h1>

          <p
            className="text-lg md:text-xl font-body-inter text-white/75 mb-10 max-w-2xl mx-auto font-light leading-relaxed opacity-0 translate-y-6"
            style={{ animation: "heroFadeUp 0.7s 0.6s forwards ease-out" }}
          >
            Tingkatkan efisiensi, capai lebih banyak pelanggan, dan kembangkan
            bisnis kuliner Anda bersama ekosistem Canteeners.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 translate-y-6"
            style={{ animation: "heroFadeUp 0.7s 0.8s forwards ease-out" }}
          >
            <a
              href="https://wa.me/6289643144013?text=Saya%20ingin%20mendaftarkan%20kedai%20saya"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-landing text-base font-bold px-8 py-4 w-full sm:w-auto text-center"
            >
              Daftar Sekarang
            </a>
            <Link
              href="/syarat-dan-ketentuan/mitra"
              className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 rounded-full px-8 py-4 text-base font-semibold w-full sm:w-auto text-center transition-all"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mengapa Memilih ── */}
      <section className="py-24 bg-[#f8f9ff] px-6">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll animation="fade-up" className="mb-16 text-center">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-[#0b1c30] mb-4 tracking-tight">
              Mengapa Memilih Canteeners?
            </h2>
            <p className="text-[#5c403c] text-lg max-w-2xl mx-auto">
              Keuntungan eksklusif menjadi mitra kami.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <AnimateOnScroll
                key={b.title}
                animation="fade-up"
                delay={i * 80}
              >
                <div className="bg-white p-8 rounded-xl flex gap-6 hover:shadow-[0_20px_40px_-15px_rgba(11,28,48,0.08)] transition-all duration-300 group h-full">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#eff4ff] rounded-full flex items-center justify-center text-[#DC2626] group-hover:bg-[#DC2626] transition-colors duration-300">
                    <span
                      className="material-symbols-outlined text-2xl group-hover:text-white transition-colors duration-300"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {b.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline text-xl font-bold text-[#0b1c30] mb-2">
                      {b.title}
                    </h3>
                    <p className="text-[#5c403c] leading-relaxed text-sm">
                      {b.desc}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Titik Implementasi Awal — Sticky Scroll ── */}
      <CanteenScrollSection />

      {/* ── Mitra yang Sudah Bergabung ── */}
      {shops.length > 0 && (
        <section className="py-24 bg-[#f8f9ff] px-6">
          <div className="max-w-7xl mx-auto">
            <AnimateOnScroll
              animation="fade-up"
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <span className="text-[#DC2626] font-bold tracking-widest uppercase text-sm mb-4 block">
                Ekosistem Kami
              </span>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-[#0b1c30] mb-4 tracking-tight">
                Telah Bergabung Bersama Kami
              </h2>
              <p className="text-[#5c403c] text-lg">
                Bergabunglah dengan pemilik kedai yang telah mendigitalisasi bisnis
                mereka di Canteeners.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop, idx) => (
                <AnimateOnScroll key={idx} animation="fade-up" delay={idx * 80}>
                  <div className="bg-white rounded-2xl overflow-hidden card-shadow group hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={getImageUrl("/shop/" + shop.image_url)}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 bg-white/85 backdrop-blur-sm text-[#0b1c30] text-xs font-semibold px-3 py-1.5 rounded-full">
                          <svg
                            className="w-3.5 h-3.5 text-[#DC2626] fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                          {shop.average_rating.toFixed(1)} ({shop.total_ratings})
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-headline font-bold text-[#0b1c30] text-lg line-clamp-1 mb-1">
                        {shop.name}
                      </h3>
                      <div className="flex items-center text-[#5c403c] text-sm mb-2">
                        <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span>{shop.canteen.name}</span>
                      </div>
                      <p className="text-sm text-[#5c403c]/80 line-clamp-2 font-body-inter">
                        {shop.description || "Menyediakan hidangan terbaik untuk mahasiswa Unhas."}
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimoni Tunggal ── */}
      <section className="py-24 bg-[#f8f9ff] px-6 relative overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#DC2626]/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

        <div className="max-w-4xl mx-auto text-center">
          <AnimateOnScroll animation="fade-up">
            <span className="text-[#DC2626] font-bold tracking-widest uppercase text-sm mb-4 block">
              Kisah Sukses
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-[#0b1c30] mb-12 tracking-tight">
              Telah Bergabung
            </h2>

            <div className="bg-white p-10 md:p-14 rounded-2xl relative card-shadow">
              {/* Quote icon */}
              <svg
                className="absolute top-8 left-8 w-12 h-12 text-[#eff4ff] fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
              </svg>

              <p className="text-xl md:text-2xl font-medium text-[#0b1c30] leading-relaxed mb-10 relative z-10 italic font-headline">
                "Sejak menggunakan Canteeners, antrean di kedai saya jauh lebih
                teratur. Mahasiswa senang karena tidak perlu lama menunggu, dan
                omzet saya naik hampir{" "}
                <span className="text-[#DC2626] not-italic font-bold">30%</span>{" "}
                di bulan pertama!"
              </p>

              <div className="flex items-center justify-center gap-5">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
                  alt="Ibu Siti"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#e5eeff]"
                />
                <div className="text-left">
                  <h4 className="font-headline font-bold text-[#0b1c30] text-lg">
                    Ibu Siti
                  </h4>
                  <p className="text-[#5c403c] text-sm">
                    Pemilik Kedai Subarjo, Kantin Kudapan
                  </p>
                  <div className="flex items-center gap-0.5 mt-1.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-[#DC2626] fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── CTA Siap Bergabung ── */}
      <section className="py-24 px-6 text-white text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #b70011 0%, #dc2626 100%)" }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="max-w-3xl mx-auto relative z-10">
          <AnimateOnScroll animation="zoom-in">
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Siap Bergabung?
            </h2>
            <p className="text-[#ffdad6] text-lg mb-10 font-body-inter">
              Tim kami siap membantu proses pendaftaran dan onboarding kedai Anda.
            </p>
            <a
              href="https://wa.me/6289643144013?text=Halo%20Admin%2C%20saya%20tertarik%20mendaftarkan%20kedai%20saya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-[#DC2626] hover:bg-[#fff5f5] font-bold rounded-full px-10 py-4 text-lg transition-all hover:-translate-y-1 shadow-xl"
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                chat
              </span>
              Hubungi via WhatsApp
            </a>
            <p className="text-xs text-white/55 mt-6 italic">
              *Dengan mendaftar, Anda menyetujui Syarat &amp; Ketentuan Mitra Canteeners.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <LandingFooter />

      {/* Hero keyframe */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
