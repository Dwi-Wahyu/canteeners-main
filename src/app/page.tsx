import Link from "next/link";
import LandingTopbar from "@/components/layouts/landing-topbar";
import LandingFooter from "@/components/layouts/landing-footer";
import AnimateOnScroll from "@/components/animate-on-scroll";
import TestimoniCarousel from "@/components/testimoni-carousel";

export default async function LandingPage() {
  return (
    <div className="bg-[#f8f9ff]">
      <LandingTopbar />

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
        {/* Background Image + Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&q=80"
            alt="Makanan sehat dan lezat"
            className="w-full h-full object-cover"
            style={{
              transform: "scale(1.08)",
              willChange: "transform",
            }}
          />
          <div className="absolute inset-0 bg-black/62" />
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center text-white">
          {/* Badge */}
          <div
            className="inline-block py-1.5 px-5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-headline text-sm font-semibold mb-7 opacity-0 translate-y-6"
            style={{ animation: "heroFadeUp 0.7s 0.2s forwards ease-out" }}
          >
            #1 Kantin Digital di Kampus
          </div>

          <h1
            className="font-headline text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] opacity-0 translate-y-6"
            style={{ animation: "heroFadeUp 0.7s 0.4s forwards ease-out" }}
          >
            Lewati Antrean,{" "}
            <br className="hidden sm:block" />
            <span className="text-[#ffb4ab]">Nikmati Makananmu.</span>
          </h1>

          <p
            className="text-lg text-white/80 mb-10 max-w-2xl mx-auto font-body-inter leading-relaxed opacity-0 translate-y-6"
            style={{ animation: "heroFadeUp 0.7s 0.6s forwards ease-out" }}
          >
            Pesan makanan favoritmu dari kantin kampus tanpa ribet. Bayar mudah,
            ambil pesanan saat sudah siap. Waktumu berharga, gunakan untuk hal
            yang lebih penting.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 translate-y-6"
            style={{ animation: "heroFadeUp 0.7s 0.8s forwards ease-out" }}
          >
            <Link
              href="/kantin/kantin-kudapan"
              className="inline-flex items-center justify-center gap-2 bg-[#DC2626]/85 hover:bg-[#DC2626] backdrop-blur-md border border-white/20 text-white rounded-full text-lg px-8 py-4 font-bold transition-all shadow-lg shadow-red-600/25"
            >
              Mulai Pesan
              <span className="material-symbols-outlined text-xl">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/mitra"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-full text-lg px-8 py-4 font-medium transition-all backdrop-blur-sm"
            >
              Daftar Mitra
            </Link>
          </div>

          {/* Social Proof */}
          <div
            className="mt-16 flex flex-col items-center justify-center gap-3 opacity-0"
            style={{ animation: "heroFadeUp 0.7s 1s forwards ease-out" }}
          >
            <div className="flex -space-x-3">
              {[
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Pengguna ${i + 1}`}
                  className="w-11 h-11 rounded-full border-2 border-black/30 object-cover"
                />
              ))}
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border-2 border-black/30 flex items-center justify-center text-white font-bold text-xs">
                +2k
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-0.5 mb-1">
                {[...Array(4)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-[#ffb4ab] fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
                <svg
                  className="w-5 h-5 text-[#ffb4ab] fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27V2l2.81 6.63z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white/80">
                4.8/5 dari 2,000+ mahasiswa
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fitur Unggulan ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <AnimateOnScroll animation="fade-up" className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-5 text-[#0b1c30]">
              Mengapa Memilih Canteeners?
            </h2>
            <p className="text-[#0b1c30]/60 font-body-inter text-lg">
              Kami mendesain ulang pengalaman jajan di kantin agar lebih cepat,
              higienis, dan tanpa stres.
            </p>
          </AnimateOnScroll>

          <div className="flex flex-col gap-6">
            {[
              {
                icon: "speed",
                title: "Tanpa Antre",
                desc: "Pesan dari kelas, ambil saat istirahat. Tidak ada lagi waktu terbuang untuk mengantre panjang di depan tenant.",
              },
              {
                icon: "payments",
                title: "Pembayaran Mulus",
                desc: "Dukung berbagai metode pembayaran digital mulai dari QRIS, e-wallet, hingga transfer bank langsung dari aplikasi.",
              },
              {
                icon: "restaurant_menu",
                title: "Menu Terlengkap",
                desc: "Jelajahi seluruh menu dari semua tenant kantin dalam satu genggaman. Selalu up-to-date dengan ketersediaan stok.",
              },
            ].map((feature, i) => (
              <AnimateOnScroll
                key={feature.title}
                animation="fade-right"
                delay={i * 120}
              >
                <div className="bg-white flex items-start gap-5 p-7 rounded-2xl border border-[#e6bdb8]/15 card-shadow group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-[#DC2626]/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#DC2626] group-hover:rotate-6 transition-all duration-500">
                    <span className="material-symbols-outlined text-[#DC2626] text-2xl group-hover:text-white transition-colors duration-300">
                      {feature.icon}
                    </span>
                  </div>
                  {/* Text */}
                  <div>
                    <h3 className="font-headline text-xl font-extrabold mb-2 text-[#0b1c30] tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-[#0b1c30]/60 font-body-inter leading-relaxed text-sm">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cara Kerja ── */}
      <section className="py-24 bg-[#f8f9ff]" id="cara-pesan">
        <div className="max-w-5xl mx-auto px-6">
          <AnimateOnScroll animation="fade-up" className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-5 text-[#0b1c30]">
              Cara Kerja{" "}
              <span className="text-[#DC2626]">Canteeners</span>
            </h2>
            <p className="text-[#0b1c30]/60 font-body-inter text-lg">
              Hanya butuh beberapa ketukan di layar handphone Anda untuk
              menikmati makanan favorit tanpa harus menunggu lama.
            </p>
          </AnimateOnScroll>

          <div className="relative max-w-4xl mx-auto">
            {/* Central Line */}
            <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-0.5 bg-[#DC2626] md:-translate-x-1/2 rounded-full opacity-70 z-0" />

            <div className="space-y-14 relative z-10">
              {[
                {
                  side: "left",
                  icon: "search",
                  title: "1. Pilih Menu",
                  desc: "Pilih makanan dari tenant favorit di kantin kampusmu.",
                  highlight: false,
                },
                {
                  side: "right",
                  icon: "shopping_cart_checkout",
                  title: "2. Checkout",
                  desc: "Masukkan pesanan ke keranjang dan sesuaikan detail pesanan.",
                  highlight: false,
                },
                {
                  side: "left",
                  icon: "qr_code_scanner",
                  title: "3. Bayar Digital",
                  desc: "Selesaikan pembayaran menggunakan e-wallet pilihanmu.",
                  highlight: false,
                },
                {
                  side: "right",
                  icon: "takeout_dining",
                  title: "4. Ambil Pesanan",
                  desc: "Dapatkan notifikasi saat makanan siap, lalu ambil di loket.",
                  highlight: true,
                },
              ].map((item, i) => (
                <AnimateOnScroll
                  key={item.title}
                  animation={item.side === "left" ? "fade-right" : "fade-left"}
                  delay={i * 100}
                >
                  <div className="flex flex-col md:flex-row items-center w-full">
                    {/* Left side */}
                    <div
                      className={`md:w-1/2 w-full relative ${
                        item.side === "left"
                          ? "flex md:justify-end pr-0 md:pr-12 pl-20 md:pl-0"
                          : "hidden md:block"
                      }`}
                    >
                      {item.side === "left" && (
                        <>
                          <div className="absolute left-[18px] md:hidden top-1/2 w-6 h-0.5 bg-[#DC2626] -translate-y-1/2 rounded-l-full" />
                          <div className="hidden md:block absolute right-0 top-1/2 w-12 h-0.5 bg-[#DC2626] -translate-y-1/2 rounded-l-full" />
                          <div
                            className={`flex items-center gap-5 md:flex-row-reverse p-6 rounded-2xl border w-full md:w-auto ${
                              item.highlight
                                ? "bg-[#DC2626]/5 border-[#DC2626]/20 shadow-md"
                                : "bg-white border-[#e6bdb8]/15 card-shadow"
                            }`}
                          >
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                                item.highlight
                                  ? "bg-[#DC2626] shadow-lg shadow-[#DC2626]/30"
                                  : "bg-[#DC2626]/10 border-2 border-[#DC2626]"
                              }`}
                            >
                              <span
                                className={`material-symbols-outlined text-2xl ${
                                  item.highlight ? "text-white" : "text-[#DC2626]"
                                }`}
                              >
                                {item.icon}
                              </span>
                            </div>
                            <div className="md:text-right">
                              <h4 className="font-headline text-lg font-bold mb-1 text-[#DC2626]">
                                {item.title}
                              </h4>
                              <p className="text-sm text-[#0b1c30]/65 font-body-inter">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right side */}
                    <div
                      className={`md:w-1/2 w-full relative ${
                        item.side === "right"
                          ? "flex md:justify-start pl-20 md:pl-12"
                          : "hidden md:block"
                      }`}
                    >
                      {item.side === "right" && (
                        <>
                          <div className="absolute left-[18px] md:left-0 top-1/2 w-6 md:w-12 h-0.5 bg-[#DC2626] -translate-y-1/2 rounded-r-full" />
                          <div
                            className={`flex items-center gap-5 p-6 rounded-2xl border w-full md:w-auto ${
                              item.highlight
                                ? "bg-[#DC2626]/5 border-[#DC2626]/20 shadow-md"
                                : "bg-white border-[#e6bdb8]/15 card-shadow"
                            }`}
                          >
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                                item.highlight
                                  ? "bg-[#DC2626] shadow-lg shadow-[#DC2626]/30"
                                  : "bg-[#DC2626]/10 border-2 border-[#DC2626]"
                              }`}
                            >
                              <span
                                className={`material-symbols-outlined text-2xl ${
                                  item.highlight ? "text-white" : "text-[#DC2626]"
                                }`}
                              >
                                {item.icon}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-headline text-lg font-bold mb-1 text-[#DC2626]">
                                {item.title}
                              </h4>
                              <p className="text-sm text-[#0b1c30]/65 font-body-inter">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimoni ── */}
      <section className="py-24 bg-[#eff4ff]" id="testimoni">
        <div className="max-w-7xl mx-auto px-6">
          <AnimateOnScroll animation="fade-up" className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-5 text-[#0b1c30]">
              Apa Kata Mereka?
            </h2>
            <p className="text-[#0b1c30]/60 font-body-inter text-lg">
              Ribuan mahasiswa dan tenant telah merasakan kemudahan menggunakan
              Canteeners setiap harinya.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={150}>
            <TestimoniCarousel />
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── CTA Mitra ── */}
      <section className="py-24 relative overflow-hidden bg-[#DC2626]">
        <div
          className="absolute inset-0 z-10 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="max-w-4xl mx-auto px-6 relative z-20 text-center">
          <AnimateOnScroll animation="zoom-in">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-8 text-white leading-tight">
              Punya Warung di Kantin?{" "}
              <br className="hidden sm:block" />
              Mari Berkembang Bersama!
            </h2>
            <p className="text-red-100 font-body-inter text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Tingkatkan efisiensi pelayanan, jangkau lebih banyak pelanggan, dan
              kelola laporan keuangan warung Anda secara otomatis dengan
              Canteeners Mitra.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                href="/mitra"
                className="inline-flex items-center justify-center bg-white text-[#DC2626] hover:bg-red-50 rounded-full px-8 py-4 font-bold transition-all shadow-lg text-lg"
              >
                Daftar Jadi Mitra
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center bg-transparent border border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-4 font-bold transition-all text-lg"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <LandingFooter />

      {/* Keyframe animations for hero */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
