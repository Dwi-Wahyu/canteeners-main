"use client";

import { useEffect, useCallback } from "react";
import { X, ZoomIn } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt = "Peta Lantai", onClose }: ImageLightboxProps) {
  // Tutup saat tekan Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      {/* Tombol tutup */}
      <button
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors z-10"
        onClick={onClose}
        aria-label="Tutup"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Label */}
      <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium pointer-events-none">
        {alt}
      </p>

      {/* Gambar — klik gambar TIDAK menutup modal */}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Hint */}
      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/40 text-xs pointer-events-none">
        Klik di luar gambar untuk menutup
      </p>
    </div>
  );
}

interface MapImageButtonProps {
  src: string;
  alt?: string;
  onOpen: () => void;
}

export function MapImageButton({ src, alt, onOpen }: MapImageButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative w-full mb-4 group focus:outline-none"
      aria-label="Lihat peta lebih besar"
    >
      <img
        src={src}
        alt={alt}
        className="w-full shadow rounded-lg transition-transform duration-200 group-hover:scale-[1.01]"
      />
      {/* Overlay saat hover */}
      <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow">
          <ZoomIn className="w-4 h-4 text-gray-700" />
          <span className="text-xs font-medium text-gray-700">Perbesar</span>
        </div>
      </div>
    </button>
  );
}
