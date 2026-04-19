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

  const menu = [
    { label: "Home", href: "/" },
    { label: "Belanja", href: "/kantin/kantin-kudapan" },
    { label: "Login", href: "/login-kedai" },
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

        {/* Menu desktop */}
        <nav className="hidden md:flex space-x-8 items-center font-headline font-semibold text-sm tracking-tight">
          {menu.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={`transition-colors duration-300 ${
                i === 0
                  ? "text-[#DC2626] border-b-2 border-[#DC2626] pb-1"
                  : scrolled
                  ? "text-slate-600 hover:text-[#DC2626]"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login-kedai"
            className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
              scrolled
                ? "bg-[#dce9ff] text-[#596373] hover:bg-[#d3e4fe]"
                : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20"
            }`}
          >
            Masuk
          </Link>
          <Link
            href="/kantin/kantin-kudapan"
            className="btn-primary-landing text-sm px-5 py-2.5"
          >
            Mulai Pesan
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
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-6 pb-6 pt-2 space-y-4 landing-nav-glass border-t border-white/10">
          {menu.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-slate-700 font-semibold hover:text-[#DC2626] transition-colors py-1"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link
              href="/login-kedai"
              className="flex-1 text-center px-4 py-2.5 rounded-full font-semibold text-sm bg-[#dce9ff] text-[#596373] hover:bg-[#d3e4fe] transition-all"
            >
              Masuk
            </Link>
            <Link
              href="/kantin/kantin-kudapan"
              className="flex-1 text-center btn-primary-landing text-sm px-4 py-2.5"
            >
              Mulai Pesan
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
