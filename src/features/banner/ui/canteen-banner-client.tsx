"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Banner {
  id: string;
  img: string;
  cta: string | null;
}

export default function CanteenBannerClient({ banners }: { banners: Banner[] }) {
  const [activeBanner, setActiveBanner] = useState(0);

  // Auto-slide banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // Ganti setiap 5 detik

    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {banners.length > 0 ? (
        banners.map((banner, i) => (
          <div
            key={banner.id}
            className="transition-all duration-500"
            style={{ display: i === activeBanner ? "block" : "none" }}
          >
            <Link href={banner.cta || "#"}>
              <div className="relative rounded-2xl overflow-hidden aspect-[16/7] md:aspect-[21/7]">
                <img
                  src={banner.img}
                  alt={`Banner ${i + 1}`}
                  className="w-full h-full object-cover"
                  style={{ transition: "transform 0.5s ease" }}
                />
              </div>
            </Link>
          </div>
        ))
      ) : (
        <div className="relative rounded-2xl overflow-hidden aspect-[16/7] md:aspect-[21/7] bg-gray-200 animate-pulse flex items-center justify-center">
          <p className="text-gray-400 font-medium">Memuat promo...</p>
        </div>
      )}

      {/* Banner Indicators */}
      {banners.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeBanner ? 24 : 8,
                height: 8,
                background: i === activeBanner ? "#DC2626" : "#ffffff80",
              }}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
