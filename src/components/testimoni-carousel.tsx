"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";

function StarRating({
  count,
  half = false,
}: {
  count: number;
  half?: boolean;
}) {
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

function TestimoniCard({ t }: { t: any }) {
  return (
    <div className="bg-white p-7 rounded-xl card-shadow border border-[#e6bdb8]/15 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-5">
        <img
          src={`https://api.dicebear.com/9.x/initials/svg?seed=${t.from}`}
          alt={t.from}
          className="w-13 h-13 rounded-full object-cover flex-shrink-0"
          style={{ width: 52, height: 52 }}
        />
        <div>
          <h4 className="font-headline font-bold text-[#0b1c30] text-base">
            {t.from}
          </h4>
          <p className="text-sm text-[#0b1c30]/55 mt-0.5">
            {t.role || "Pengguna"}
          </p>
        </div>
      </div>
      <StarRating count={t.rating} half={t.rating < 5} />
      <p className="text-[#0b1c30]/70 font-body-inter text-sm leading-relaxed flex-1">
        "{t.message}"
      </p>
    </div>
  );
}

export default function TestimoniCarousel({
  testimonies,
}: {
  testimonies: any[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!testimonies || testimonies.length === 0) return null;

  return (
    <>
      {/* Mobile: Embla Carousel horizontal scroll */}
      <div className="md:hidden">
        <div className="overflow-hidden -mx-6" ref={emblaRef}>
          <div className="flex gap-4 px-6">
            {testimonies.map((t, idx) => (
              <div key={idx} className="flex-none w-[80vw] max-w-sm">
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
        {testimonies.map((t, idx) => (
          <TestimoniCard key={idx} t={t} />
        ))}
      </div>
    </>
  );
}
