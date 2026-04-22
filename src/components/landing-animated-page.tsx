"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import TestimoniCarousel from "@/components/testimoni-carousel";

/* ── Animated Counter ─────────────────────────────────────── */
function AnimatedCounter({
  target,
  suffix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const pct = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - pct, 3); // ease-out cubic
            setCount(Math.floor(eased * target));
            if (pct < 1) requestAnimationFrame(tick);
            else setCount(target);
          };
          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ── Scroll-Reveal Wrapper ────────────────────────────────── */
function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "zoom";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); ob.unobserve(el); } },
      { threshold: 0.12 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const base =
    direction === "up" ? "translate-y-12 opacity-0" :
    direction === "down" ? "-translate-y-12 opacity-0" :
    direction === "left" ? "translate-x-16 opacity-0" :
    direction === "right" ? "-translate-x-16 opacity-0" :
    "scale-90 opacity-0";
  const vis = "translate-y-0 translate-x-0 scale-100 opacity-100";

  return (
    <div
      ref={ref}
      className={`transition-all ${className}`}
      style={{
        transitionDuration: "700ms",
        transitionDelay: visible ? `${delay}ms` : "0ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className={`transition-all ${visible ? vis : base}`}
        style={{
          transitionDuration: "700ms",
          transitionDelay: visible ? `${delay}ms` : "0ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
        {children}
      </div>
    </div>
  );
}

/* ── Floating Particle ────────────────────────────────────── */
function Particle({ x, y, size, opacity, duration, delay }: {
  x: number; y: number; size: number; opacity: number;
  duration: number; delay: number;
}) {
  return (
    <div
      className="absolute rounded-full bg-white pointer-events-none"
      style={{
        left: `${x}%`, top: `${y}%`,
        width: size, height: size,
        opacity,
        animation: `floatParticle ${duration}s ${delay}s ease-in-out infinite alternate`,
      }}
    />
  );
}

/* ── Hero Slides Data ────────────────────────────────────── */
const heroSlides = [
  {
    img: "/visual/hero-slide-1-baru.png",
    alt: "Kantin kampus dengan tampilan app Canteeners",
    accent: "from-[#DC2626]/30",
    label: "Scan & Pesan",
  },
  {
    img: "/visual/hero-slide-2.png",
    alt: "Suasana kantin modern dengan Canteeners",
    accent: "from-[#b91c1c]/35",
    label: "Tanpa Antre",
  },
];

/* ── Main Component ───────────────────────────────────────── */
export default function LandingAnimatedPage() {
  /* Hero Slider */
  const [slideIdx, setSlideIdx] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback((idx: number) => {
    setSlideIdx(idx);
  }, []);

  const nextSlide = useCallback(() => {
    setSlideIdx((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setSlideIdx((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [startAutoPlay]);

  /* Swipe logic */
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsSwiping(true);
    setTouchEnd(null);
    if ("targetTouches" in e) setTouchStart(e.targetTouches[0].clientX);
    else setTouchStart((e as React.MouseEvent).clientX);
    
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwiping) return;
    if ("targetTouches" in e) setTouchEnd(e.targetTouches[0].clientX);
    else if (touchStart !== null) setTouchEnd((e as React.MouseEvent).clientX);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (!touchStart || !touchEnd) {
      setTouchStart(null);
      setTouchEnd(null);
      startAutoPlay();
      return;
    }
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    else if (distance < -minSwipeDistance) prevSlide();
    
    setTouchStart(null);
    setTouchEnd(null);
    startAutoPlay();
  };

  const dragOffset = isSwiping && touchStart !== null && touchEnd !== null ? touchEnd - touchStart : 0;

  /* Typing badge */
  const taglines = ["#1 Kantin Digital di Kampus", "Tanpa Antre. Tanpa Ribet.", "Pesan Sekarang, Ambil Langsung."];
  const [tagIdx, setTagIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const target = taglines[tagIdx];
    let i = typing ? displayed.length : displayed.length;
    if (typing) {
      if (displayed.length < target.length) {
        const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 2000);
        return () => clearTimeout(t);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
        return () => clearTimeout(t);
      } else {
        setTagIdx((prev) => (prev + 1) % taglines.length);
        setTyping(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed, typing, tagIdx]);

  /* particles (stable, computed once) */
  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      x: (i * 37 + 11) % 97,
      y: (i * 53 + 7) % 93,
      size: 2 + (i % 4),
      opacity: 0.06 + (i % 5) * 0.035,
      duration: 4 + (i % 5),
      delay: (i * 0.4) % 3,
    }))
  ).current;


  const features = [
    { icon: "speed", title: "Tanpa Antre", desc: "Pesan dari kelas, ambil saat istirahat. Tidak ada lagi waktu terbuang untuk mengantre panjang." },
    { icon: "payments", title: "Pembayaran Mulus", desc: "QRIS, e-wallet, transfer bank — semua tersedia dalam satu interface yang ringan." },
    { icon: "restaurant_menu", title: "Menu Terlengkap", desc: "Jelajahi seluruh menu dari semua tenant kantin. Selalu up-to-date dengan stok terkini." },
  ];

  return (
    <div className="bg-[#f8f9ff] overflow-x-hidden">

      {/* ── Hero Slider ───────────────────────────────────────── */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        {/* Slide Stack */}
        <div 
          className={`absolute inset-0 z-0 flex ${isSwiping ? '' : 'transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]'}`}
          style={{ width: `${heroSlides.length * 100}%`, transform: `translateX(calc(-${(slideIdx * 100) / heroSlides.length}% + ${dragOffset}px))` }}
        >
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              className="relative w-full h-full flex-1"
            >
              <img
                src={slide.img}
                alt={slide.alt}
                className="w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/75 pointer-events-none" />
              <div className={`absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t ${slide.accent} to-transparent pointer-events-none`} />
            </div>
          ))}
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl w-full mx-auto px-6 relative z-10 flex flex-col justify-between md:justify-center items-center text-center text-white min-h-[75vh] md:min-h-0 md:gap-8">
          
          {/* Top Section (Title) */}
          <div className="pt-2 md:pt-0 w-full mb-0 md:mb-2">
            {/* Typing Badge */}
            <div
              className="inline-block py-1.5 px-4 md:px-5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-headline text-xs md:text-sm font-semibold mb-6 md:mb-8 opacity-0 translate-y-6 min-w-fit md:min-w-[280px] shadow-sm"
              style={{ animation: "heroFadeUp 0.7s 0.2s forwards ease-out" }}
            >
              <span>{displayed}</span>
              <span className="animate-pulse ml-0.5 opacity-70">|</span>
            </div>

            <h1
              className="font-headline text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] md:leading-[1.1] opacity-0 translate-y-6 drop-shadow-2xl"
              style={{ animation: "heroFadeUp 0.7s 0.4s forwards ease-out" }}
            >
              Lewati Antrean,{" "}
              <br className="hidden sm:block" />
              <span className="text-[#ffb4ab]">Nikmati Makananmu.</span>
            </h1>
          </div>

          {/* Middle Section (Description Text) */}
          <div className="flex-1 flex flex-col justify-center w-full md:flex-none md:block my-4 md:my-0">
            <p
              className="text-base md:text-lg text-white/90 max-w-2xl mx-auto font-body-inter leading-relaxed opacity-0 translate-y-6 drop-shadow-md"
              style={{ animation: "heroFadeUp 0.7s 0.6s forwards ease-out" }}
            >
              Pesan makanan favoritmu dari kantin kampus tanpa ribet. Bayar mudah,
              ambil pesanan saat sudah siap. Waktumu berharga, gunakan untuk hal
              yang lebih penting.
            </p>
          </div>

          {/* Bottom Section (Buttons) */}
          <div
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pb-16 md:pb-0 w-full opacity-0 translate-y-6"
            style={{ animation: "heroFadeUp 0.7s 0.8s forwards ease-out" }}
          >
            <Link
              href="/kantin/kantin-kudapan"
              className="group inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#b91c1c] border border-white/10 text-white rounded-full text-base md:text-lg px-8 py-3.5 md:py-4 font-bold transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-1 hover:scale-105"
            >
              Mulai Pesan
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform duration-300">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/mitra"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-full text-base md:text-lg px-8 py-3.5 md:py-4 font-medium transition-all duration-300 backdrop-blur-sm hover:-translate-y-1"
            >
              Daftar Mitra
            </Link>
          </div>
        </div>

        {/* ── Slider Controls ─────────────────────────────── */}

        {/* Dot Indicators + Slide Label */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
          {/* Slide label */}
          <span className="text-white/60 text-xs uppercase tracking-widest font-medium bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
            {heroSlides[slideIdx].label}
          </span>
          {/* Dots */}
          <div className="flex items-center gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-1.5 rounded-full transition-all duration-500 overflow-hidden"
                style={{ width: i === slideIdx ? 32 : 8, background: i === slideIdx ? "white" : "rgba(255,255,255,0.35)" }}
              >
                {i === slideIdx && (
                  <span
                    className="absolute inset-0 bg-[#DC2626] rounded-full origin-left"
                    style={{ animation: "slideProgress 3s linear infinite" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Slide counter top-right */}
        <div className="absolute top-28 right-6 md:right-10 z-20 text-white/50 text-sm font-mono font-bold">
          <span className="text-white">{String(slideIdx + 1).padStart(2, "0")}</span>
          <span className="mx-1">/</span>
          <span>{String(heroSlides.length).padStart(2, "0")}</span>
        </div>
      </section>

      {/* ── Stats Ticker ──────────────────────────────────────── */}
      <section className="bg-[#0b1c30] py-12 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Kantin Terdaftar", value: 20, suffix: "+" },
            { label: "Porsi Terjual", value: 4, suffix: "k+" },
            { label: "Jam Dihemat", value: 6, suffix: "k+" },
            { label: "Mahasiswa Aktif", value: 2, suffix: "k+" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100} direction="up">
              <div className="flex flex-col items-center gap-1 group">
                <span className="text-4xl md:text-5xl font-black text-[#DC2626] group-hover:scale-110 transition-transform duration-300 inline-block">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wide">{stat.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal direction="up" className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[#DC2626] font-bold text-sm uppercase tracking-widest mb-3">Mengapa Canteeners?</p>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-5 text-[#0b1c30]">
              Dirancang untuk Kehidupan Kampus
            </h2>
            <p className="text-[#0b1c30]/60 font-body-inter text-lg">
              Kami mendesain ulang pengalaman jajan di kantin agar lebih cepat, higienis, dan tanpa stres.
            </p>
          </Reveal>

          <div className="flex flex-col gap-5">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 120} direction="right">
                <div className="group flex items-start gap-6 p-7 rounded-2xl border border-[#e6bdb8]/20 bg-white card-shadow hover:-translate-y-1.5 hover:shadow-xl hover:border-[#DC2626]/20 transition-all duration-400 cursor-default">
                  <div className="w-14 h-14 rounded-2xl bg-[#DC2626]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#DC2626] group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                    <span className="material-symbols-outlined text-[#DC2626] text-2xl group-hover:text-white transition-colors duration-300">
                      {f.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline text-xl font-extrabold mb-2 text-[#0b1c30] tracking-tight group-hover:text-[#DC2626] transition-colors duration-300">
                      {f.title}
                    </h3>
                    <p className="text-[#0b1c30]/60 font-body-inter leading-relaxed text-sm">{f.desc}</p>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 self-center">
                    <span className="material-symbols-outlined text-[#DC2626] text-xl">arrow_forward</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="py-24 bg-[#f8f9ff]" id="cara-pesan">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal direction="up" className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-5 text-[#0b1c30]">
              Cara Kerja{" "}
              <span className="text-[#DC2626]">Canteeners</span>
            </h2>
            <p className="text-[#0b1c30]/60 font-body-inter text-lg">
              Hanya butuh beberapa ketukan di layar handphone Anda untuk
              menikmati makanan favorit tanpa harus menunggu lama.
            </p>
          </Reveal>

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
                <Reveal
                  key={item.title}
                  direction={item.side === "left" ? "right" : "left"}
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
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-24 bg-[#eff4ff]" id="testimoni">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal direction="up" className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[#DC2626] font-bold text-sm uppercase tracking-widest mb-3">Testimoni</p>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-5 text-[#0b1c30]">
              Apa Kata Mereka?
            </h2>
            <p className="text-[#0b1c30]/60 font-body-inter text-lg">
              Ribuan mahasiswa dan tenant telah merasakan kemudahan Canteeners setiap harinya.
            </p>
          </Reveal>
          <Reveal direction="up" delay={150}>
            <TestimoniCarousel />
          </Reveal>
        </div>
      </section>

      {/* ── CTA Mitra ────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden bg-[#DC2626]">
        {/* Dot grid */}
        <div
          className="absolute inset-0 z-10 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#0b1c30]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-20 text-center">
          <Reveal direction="zoom">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-8 text-white leading-tight">
              Punya Warung di Kantin?{" "}
              <br className="hidden sm:block" />
              Mari Berkembang Bersama!
            </h2>
            <p className="text-red-100 font-body-inter text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Tingkatkan efisiensi pelayanan, jangkau lebih banyak pelanggan, dan
              kelola laporan keuangan warung Anda secara otomatis.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                href="/mitra"
                className="group inline-flex items-center justify-center gap-2 bg-white text-[#DC2626] hover:bg-red-50 rounded-full px-8 py-4 font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg"
              >
                Daftar Jadi Mitra
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center bg-transparent border border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-4 font-bold transition-all duration-300 hover:-translate-y-1 text-lg"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Global keyframes */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatParticle {
          from { transform: translateY(0px) translateX(0px); }
          to   { transform: translateY(-18px) translateX(8px); }
        }
        @keyframes slideProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
