"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingTopbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", href: "/", icon: "home" },
    { label: "Belanja", href: "/kantin", icon: "shopping_bag" },
    { label: "Login", href: "/login-pelanggan", icon: "person" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "landing-nav-glass shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-black tracking-tighter text-[#DC2626] font-headline"
        >
          Canteeners
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 font-headline font-semibold text-sm tracking-tight">
          {navItems.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-1.5 transition-colors duration-300 ${
                i === 0
                  ? "text-[#DC2626] border-b-2 border-[#DC2626] pb-1"
                  : scrolled
                  ? "text-slate-600 hover:text-[#DC2626]"
                  : "text-white/90 hover:text-white"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 18,
                  fontVariationSettings: i === 0 ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Notifikasi Button */}
          <Link
            href="/notifikasi"
            className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
              scrolled
                ? "bg-[#dce9ff] text-[#596373] hover:bg-[#d3e4fe]"
                : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
              notifications
            </span>
            Notifikasi
            {/* Red dot indicator */}
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{
                background: "#DC2626",
                borderColor: scrolled ? "#dce9ff" : "transparent",
              }}
            />
          </Link>

          {/* Mulai Pesanan Button */}
          <Link
            href="/kantin"
            className="flex items-center gap-2 btn-primary-landing text-sm px-5 py-2.5"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              add_shopping_cart
            </span>
            Mulai Pesanan
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${
            scrolled ? "text-slate-700" : "text-white"
          }`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-6 pb-6 pt-2 space-y-3 landing-nav-glass border-t border-white/10">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 text-slate-700 font-semibold hover:text-[#DC2626] transition-colors py-1.5"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, color: "#DC2626" }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            {/* Notifikasi mobile */}
            <Link
              href="/notifikasi"
              onClick={() => setMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-sm bg-[#dce9ff] text-[#596373] hover:bg-[#d3e4fe] transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                notifications
              </span>
              Notifikasi
            </Link>

            {/* Mulai Pesanan mobile */}
            <Link
              href="/kantin"
              onClick={() => setMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 btn-primary-landing text-sm px-4 py-2.5"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                add_shopping_cart
              </span>
              Mulai Pesanan
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
