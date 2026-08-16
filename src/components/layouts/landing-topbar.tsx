"use client";

import {
  Home,
  House,
  Menu,
  ShoppingBag,
  ShoppingCart,
  Store,
  Users,
  X,
} from "lucide-react";
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

  // const navItems = [
  //   { label: "Home", href: "/", icon: "home" },
  //   { label: "Belanja", href: "/kantin", icon: "shopping_bag" },
  //   { label: "Login Pelanggan", href: "/login-pelanggan", icon: "person" },
  //   { label: "Login Mitra", href: "/login-kedai", icon: "store" },
  // ];

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Belanja", href: "/kantin", icon: ShoppingBag },
    { label: "Login Pelanggan", href: "/login-pelanggan", icon: Users },
    { label: "Login Mitra", href: "/login-kedai", icon: Store },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled || menuOpen ? "bg-background shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}

        <Link
          href="/"
          className="text-2xl font-black tracking-tighter text-[#DC2626] font-headline flex items-center"
        >
          <img
            src="/logo.png"
            alt="Canteeners"
            className="w-8 h-8 object-contain"
          />
          Canteeners
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 font-headline font-semibold text-sm tracking-tight">
          {navItems.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-1.5 transition-colors duration-100 ${
                i === 0
                  ? "text-[#DC2626] border-b-2 border-[#DC2626] pb-1"
                  : scrolled || menuOpen
                    ? "text-slate-600 hover:text-[#DC2626]"
                    : "text-white/90 hover:text-white"
              }`}
            >
              <item.icon size={20} className={i === 0 ? "text-primary" : ""} />

              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Mulai Pesanan Button */}
          <Link
            href="/kantin"
            className="flex items-center gap-2 btn-primary-landing text-sm px-5 py-2.5"
          >
            <ShoppingCart size={18} />
            Mulai Pesanan
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${
            scrolled || menuOpen ? "text-slate-700" : "text-white"
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
        <nav className="flex flex-col px-6 pb-6 pt-2 space-y-3 bg-background border-t border-white/10">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 text-slate-700 font-semibold hover:text-[#DC2626] transition-colors py-1.5"
            >
              <item.icon size={20} className="text-primary" />

              {item.label}
            </Link>
          ))}

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            {/* Mulai Pesanan mobile */}
            <Link
              href="/kantin"
              onClick={() => setMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 btn-primary-landing text-sm px-4 py-2.5"
            >
              <ShoppingCart size={16} />
              Mulai Pesanan
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
