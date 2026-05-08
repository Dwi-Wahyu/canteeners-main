"use client";

import Image from "next/image";
import { Instagram, MessageCircle } from "lucide-react";

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48" />
  </svg>
);

export default function LandingFooter() {
  return (
    <footer className="w-full py-16 bg-slate-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Brand */}
        <div>
          <a
            href="/"
            className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3 hover:text-[#DC2626] transition-colors font-headline tracking-tighter"
          >
            <Image
              src="/logo.png"
              alt="Canteeners Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            Canteeners
          </a>

          <p className="font-body-inter text-sm text-slate-500 max-w-xs mt-3 leading-relaxed">
            Mengubah cara mahasiswa dan civitas akademika menikmati waktu
            istirahat di kantin. Cepat, mudah, dan menyenangkan.
          </p>

          {/* Social Links */}
          <div className="flex gap-5 mt-6">
            <a
              href="#"
              className="text-slate-400 hover:text-[#DC2626] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="size-5" />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-[#25D366] transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="size-5" />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-black transition-colors"
              aria-label="TikTok"
            >
              <TiktokIcon className="size-5" />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col md:items-end justify-between h-full">
          <div className="flex flex-wrap gap-6 font-body-inter text-sm mb-8 md:mb-0">
            {[
              { label: "Tentang Kami", href: "#" },
              { label: "Kebijakan Privasi", href: "/kebijakan-dan-privasi" },
              {
                label: "Syarat & Ketentuan Pelanggan",
                href: "/syarat-dan-ketentuan/pelanggan",
              },
              {
                label: "Syarat & Ketentuan Mitra",
                href: "/syarat-dan-ketentuan/mitra",
              },
              { label: "Hubungi Kami", href: "/hubungi-kami" },
              { label: "Panduan Pelanggan", href: "/panduan/pelanggan" },
              { label: "Panduan Mitra", href: "/panduan/mitra" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-500 hover:text-[#DC2626] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="font-body-inter text-sm text-slate-400 mt-auto">
            © 2025 Canteeners - All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
