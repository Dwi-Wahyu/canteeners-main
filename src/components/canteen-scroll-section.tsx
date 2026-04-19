"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const canteens = [
  {
    id: 1,
    name: "Kantin Kudapan",
    visitors: 1200,
    icon: "restaurant",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80",
    badge: "Fase 1 — Lokasi Utama",
    desc: "Kantin terbesar di lingkungan Unhas dengan ratusan mahasiswa setiap harinya.",
  },
  {
    id: 2,
    name: "Kantin Sastra",
    visitors: 800,
    icon: "local_cafe",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=900&q=80",
    badge: "Fase 2",
    desc: "Pusat jajan mahasiswa Fakultas Ilmu Budaya dengan suasana yang nyaman.",
  },
  {
    id: 3,
    name: "Kantin Sosiologi",
    visitors: 950,
    icon: "lunch_dining",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80",
    badge: "Fase 2",
    desc: "Lokasi strategis di jantung kampus dengan aneka pilihan menu sehat.",
  },
];

export default function CanteenScrollSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgVisible, setImgVisible] = useState(true);
  const prevIndexRef = useRef(0);

  const handleScroll = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    // scrolled distance into section (0 → sectionHeight)
    const scrolled = -rect.top;
    // each kantin occupies (sectionHeight / canteens.length) of scroll
    const step = sectionHeight / canteens.length;
    const raw = Math.floor(scrolled / step);
    const idx = Math.max(0, Math.min(canteens.length - 1, raw));

    if (idx !== prevIndexRef.current) {
      // crossfade
      setImgVisible(false);
      setTimeout(() => {
        setActiveIndex(idx);
        prevIndexRef.current = idx;
        setImgVisible(true);
      }, 220);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const active = canteens[activeIndex];

  return (
    <section className="bg-[#eff4ff]">
      {/* Tall wrapper: each canteen = 100vh of scroll space */}
      <div
        ref={sectionRef}
        style={{ height: `${canteens.length * 100}vh` }}
        className="relative"
      >
        {/* Sticky inner container */}
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 h-full flex flex-col lg:flex-row gap-12 items-center py-20">

            {/* ── Left: text + list ── */}
            <div className="lg:w-1/2 w-full flex flex-col justify-center">
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-[#0b1c30] mb-4 tracking-tight">
                Titik Implementasi Awal
              </h2>
              <p className="text-[#5c403c] text-lg mb-10 leading-relaxed">
                Bergabunglah di lokasi-lokasi strategis yang telah kami siapkan
                untuk peluncuran fase pertama.
              </p>

              {/* Kantin List */}
              <div className="flex flex-col gap-5 relative before:absolute before:inset-y-0 before:left-8 before:w-px before:bg-[#e6bdb8]/50">
                {canteens.map((c, i) => {
                  const isActive = i === activeIndex;
                  const isPast = i < activeIndex;
                  return (
                    <div
                      key={c.id}
                      className={`relative flex items-center gap-5 z-10 transition-all duration-500 ${
                        isActive
                          ? "opacity-100 scale-100"
                          : isPast
                          ? "opacity-50 scale-[0.97]"
                          : "opacity-25 scale-[0.95] blur-[1px]"
                      }`}
                    >
                      {/* Icon circle */}
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-500 shadow-sm ${
                          isActive
                            ? "bg-white border-2 border-[#DC2626] shadow-[0_0_0_6px_rgba(220,38,38,0.08)]"
                            : isPast
                            ? "bg-white border-2 border-[#DC2626]/40"
                            : "bg-white border border-[#e6bdb8]"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-2xl transition-colors duration-300 ${
                            isActive
                              ? "text-[#DC2626]"
                              : isPast
                              ? "text-[#DC2626]/50"
                              : "text-[#5c403c]/40"
                          }`}
                          style={
                            isActive
                              ? { fontVariationSettings: "'FILL' 1" }
                              : undefined
                          }
                        >
                          {c.icon}
                        </span>
                      </div>

                      {/* Card */}
                      <div
                        className={`flex-1 p-5 rounded-xl transition-all duration-500 ${
                          isActive
                            ? "bg-white card-shadow"
                            : "bg-white/50"
                        }`}
                      >
                        <h3
                          className={`font-headline font-bold transition-all duration-300 ${
                            isActive
                              ? "text-xl text-[#0b1c30]"
                              : "text-base text-[#0b1c30]/60"
                          }`}
                        >
                          {c.name}
                        </h3>
                        <p
                          className={`text-sm mt-0.5 font-semibold transition-all duration-300 ${
                            isActive ? "text-[#DC2626]" : "text-[#5c403c]/50"
                          }`}
                        >
                          Est. {c.visitors.toLocaleString("id-ID")} pengunjung/hari
                        </p>
                        {isActive && (
                          <p className="text-xs text-[#5c403c]/70 mt-2 font-body-inter leading-relaxed">
                            {c.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scroll hint */}
              <div className="mt-10 flex items-center gap-2 text-[#5c403c]/50 text-sm font-body-inter">
                <span className="material-symbols-outlined text-base animate-bounce">
                  keyboard_arrow_down
                </span>
                <span>
                  {activeIndex < canteens.length - 1
                    ? `Scroll untuk melihat ${canteens[activeIndex + 1].name}`
                    : "Scroll untuk melanjutkan"}
                </span>
              </div>
            </div>

            {/* ── Right: photo ── */}
            <div className="lg:w-1/2 w-full h-full max-h-[75vh] lg:max-h-full flex items-center">
              <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative">
                {/* Crossfade images */}
                {canteens.map((c, i) => (
                  <img
                    key={c.id}
                    src={c.image}
                    alt={c.name}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                    style={{ opacity: i === activeIndex && imgVisible ? 1 : 0 }}
                  />
                ))}

                {/* Bottom overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent z-10">
                  <div
                    className="p-4 rounded-xl text-center transition-all duration-400"
                    style={{
                      background: "rgba(255,255,255,0.88)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    <span className="font-headline font-bold text-lg text-[#0b1c30] block transition-all duration-300">
                      {active.name}
                    </span>
                    <span className="text-sm text-[#DC2626] font-semibold">
                      {active.badge}
                    </span>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="absolute top-5 right-5 flex flex-col gap-2 z-10">
                  {canteens.map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-400 ${
                        i === activeIndex
                          ? "w-2.5 h-2.5 bg-white shadow-md"
                          : "w-2 h-2 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
