"use client";

export default function LandingFooter() {
  return (
    <footer className="w-full py-16 bg-slate-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Brand */}
        <div>
          <a
            href="/"
            className="text-xl font-black text-slate-900 mb-4 block hover:text-[#DC2626] transition-colors font-headline tracking-tighter"
          >
            Canteeners
          </a>
          <p className="font-body-inter text-sm text-slate-500 max-w-xs mt-3 leading-relaxed">
            Mengubah cara mahasiswa dan civitas akademika menikmati waktu
            istirahat di kantin. Cepat, mudah, dan menyenangkan.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col md:items-end justify-between h-full">
          <div className="flex flex-wrap gap-6 font-body-inter text-sm mb-8 md:mb-0">
            {[
              { label: "Tentang Kami", href: "#" },
              { label: "Kebijakan Privasi", href: "/kebijakan-dan-privasi" },
              { label: "Syarat & Ketentuan", href: "/syarat-dan-ketentuan/pelanggan" },
              { label: "Hubungi Kami", href: "https://wa.me/6289643144013" },
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
            © 2025 Canteeners. Crafted with Culinary Canvas.
          </p>
        </div>
      </div>
    </footer>
  );
}
