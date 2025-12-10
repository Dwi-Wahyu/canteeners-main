"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LandingTopbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="py-4 px-4 sm:px-8 bg-secondary shadow-sm fixed w-full top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex gap-2 items-center">
          <Image src={"/app-logo.svg"} width={24} height={24} alt="app-logo" />
          <h1 className="text-2xl font-semibold">Canteeners</h1>
        </div>

        {/* Menu desktop */}
        <nav className="hidden md:flex space-x-6 text-foreground">
          <a href="/#hero" className="hover:text-primary transition">
            Beranda
          </a>
          <a href="/#about" className="hover:text-primary transition">
            Tentang Kami
          </a>
          <a href="/#testimonials" className="hover:text-primary transition">
            Testimoni
          </a>
          <a href="/login-kedai" className="hover:text-primary transition">
            Login
          </a>
        </nav>

        {/* Tombol menu mobile */}
        <Button
          className="md:hidden"
          variant="ghost"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Daftar link mobile */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col mt-4 space-y-4 items-center px-4 pb-4 text-foreground bg-secondary/80 backdrop-blur-sm rounded-b-xl">
          <Link
            href="/#hero"
            onClick={() => setMenuOpen(false)}
            className="hover:text-primary transition"
          >
            Beranda
          </Link>
          <Link
            href="/#about"
            onClick={() => setMenuOpen(false)}
            className="hover:text-primary transition"
          >
            Tentang Kami
          </Link>
          <Link
            href="/#testimonials"
            onClick={() => setMenuOpen(false)}
            className="hover:text-primary transition"
          >
            Testimoni
          </Link>
          <Link
            href="/login-kedai"
            onClick={() => setMenuOpen(false)}
            className="hover:text-primary transition"
            passHref
          >
            <Button>Login</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
