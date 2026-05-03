"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

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

const heroSlides = [
  {
    img: "/visual/hero-slide-1-baru.png",
    alt: "Kantin kampus dengan tampilan app Canteeners",
    accent: "from-[#DC2626]/30",
    label: "Manajemen Mudah",
  },
  {
    img: "/visual/hero-slide-2.png",
    alt: "Suasana kantin modern dengan Canteeners",
    accent: "from-[#b91c1c]/35",
    label: "Omzet Meningkat",
  },
];

export default function MitraHero() {
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
    }, 4000);
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
  const taglines = ["#1 Mitra Kantin Digital", "Kelola Pesanan Lebih Mudah", "Tingkatkan Omzet Bisnismu"];
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

  return (
    <section 
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
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
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white pt-24 pb-16 min-h-[75vh] md:min-h-0 flex flex-col justify-between md:justify-center items-center md:gap-8">
        
        {/* Top Section */}
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
            Jadilah Bagian dari{" "}
            <br className="hidden sm:block" />
            <span className="text-[#ffb4ab]">Revolusi Kantin</span>
          </h1>
        </div>

        {/* Middle Section */}
        <div className="flex-1 flex flex-col justify-center w-full md:flex-none md:block my-4 md:my-0">
          <p
            className="text-base md:text-lg text-white/90 max-w-2xl mx-auto font-body-inter leading-relaxed opacity-0 translate-y-6 drop-shadow-md"
            style={{ animation: "heroFadeUp 0.7s 0.6s forwards ease-out" }}
          >
            Tingkatkan efisiensi, capai lebih banyak pelanggan, dan kembangkan
            bisnis kuliner Anda bersama ekosistem Canteeners.
          </p>
        </div>

        {/* Bottom Section */}
        <div
          className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pb-16 md:pb-0 w-full opacity-0 translate-y-6"
          style={{ animation: "heroFadeUp 0.7s 0.8s forwards ease-out" }}
        >
          <a
            href="https://wa.me/6289643144013?text=Saya%20ingin%20mendaftarkan%20kedai%20saya"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#b91c1c] border border-white/10 text-white rounded-full text-base md:text-lg px-8 py-3.5 md:py-4 font-bold transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-1 hover:scale-105"
          >
            Daftar Sekarang
            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform duration-300">
              arrow_forward
            </span>
          </a>
          <Link
            href="/syarat-dan-ketentuan/mitra"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-full text-base md:text-lg px-8 py-3.5 md:py-4 font-medium transition-all duration-300 backdrop-blur-sm hover:-translate-y-1"
          >
            Pelajari Lebih Lanjut
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
                  style={{ animation: "slideProgress 4s linear infinite" }}
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

      {/* Hero keyframe */}
      <style>{`
        @keyframes floatParticle {
          from { transform: translateY(0px) translateX(0px); }
          to   { transform: translateY(-18px) translateX(8px); }
        }
        @keyframes slideProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
