"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";

const testimonials = [
  {
    name: "Sarah J.",
    role: "Mahasiswi Manajemen",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    stars: 5,
    review:
      '"Sangat membantu! Saya sering ada kelas beruntun, sekarang bisa pesan makanan pas dosen lagi break, dan ambil pas turun ke kantin. Gak perlu takut kehabisan."',
  },
  {
    name: "Budi S.",
    role: "Mahasiswa Teknik",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    stars: 4,
    review:
      '"UI-nya gampang dimengerti. Waktu proses pesanannya juga cukup akurat. Saran aja, mungkin bisa ditambah fitur pesanan bareng teman."',
  },
  {
    name: "Ibu Siti",
    role: "Pemilik Warung Nasi",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    stars: 5,
    review:
      '"Semenjak pakai aplikasi ini, omset naik karena anak-anak gak malas lagi turun ke kantin. Sistem kasirnya juga mempermudah hitung-hitungan harian."',
  },
  {
    name: "Dinda A.",
    role: "Mahasiswi Kedokteran",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
    stars: 5,
    review:
      '"Jadwal kuliah padat banget, aplikasi ini beneran nolong. Bisa pesan dari perpustakaan, tinggal ambil waktu mau makan. Praktis banget!"',
  },
];

function StarRating({ count, half = false }: { count: number; half?: boolean }) {
  return (
    <div className="flex items-center gap-0.5 mb-4">
      {[...Array(count)].map((_, i) => (
        <svg
          key={i}
          className="w-5 h-5 text-[#DC2626] fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
      {half && (
        <svg
          className="w-5 h-5 text-[#DC2626] fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27V2l2.81 6.63z" />
        </svg>
      )}
    </div>
  );
}

function TestimoniCard({ t }: { t: (typeof testimonials)[0] }) {
  return (
    <div className="bg-white p-7 rounded-xl card-shadow border border-[#e6bdb8]/15 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-5">
        <img
          src={t.avatar}
          alt={t.name}
          className="w-13 h-13 rounded-full object-cover flex-shrink-0"
          style={{ width: 52, height: 52 }}
        />
        <div>
          <h4 className="font-headline font-bold text-[#0b1c30] text-base">
            {t.name}
          </h4>
          <p className="text-sm text-[#0b1c30]/55 mt-0.5">{t.role}</p>
        </div>
      </div>
      <StarRating count={t.stars} half={t.stars < 5} />
      <p className="text-[#0b1c30]/70 font-body-inter text-sm leading-relaxed flex-1">
        {t.review}
      </p>
    </div>
  );
}

export default function TestimoniCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <>
      {/* Mobile: Embla Carousel horizontal scroll */}
      <div className="md:hidden">
        <div className="overflow-hidden -mx-6" ref={emblaRef}>
          <div className="flex gap-4 px-6">
            {testimonials.map((t) => (
              <div key={t.name} className="flex-none w-[80vw] max-w-sm">
                <TestimoniCard t={t} />
              </div>
            ))}
          </div>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={scrollPrev}
            className="w-10 h-10 rounded-full bg-white border border-[#e6bdb8]/30 card-shadow flex items-center justify-center text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-all duration-200"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={scrollNext}
            className="w-10 h-10 rounded-full bg-white border border-[#e6bdb8]/30 card-shadow flex items-center justify-center text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-all duration-200"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Desktop: Grid 3 kolom */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((t) => (
          <TestimoniCard key={t.name} t={t} />
        ))}
      </div>
    </>
  );
}
