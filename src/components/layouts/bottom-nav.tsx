"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingBag, MessageCircle, Home, History, User } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Keranjang",
    href: "/keranjang",
    icon: ShoppingBag,
  },
  {
    label: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    label: "Home",
    href: "/kantin/kantin-kudapan",
    icon: Home,
    isMain: true,
  },
  {
    label: "Riwayat",
    href: "/order",
    icon: History,
  },
  {
    label: "Profil",
    href: "/profil",
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 z-50"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(220,38,38,0.08)",
        borderRadius: "1.5rem 1.5rem 0 0",
        boxShadow: "0 -8px 30px rgba(0,0,0,0.05)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center px-3 py-2 transition-all active:scale-95",
              isActive ? "text-[#DC2626]" : "text-[#94a3b8]",
            )}
            aria-label={item.label}
          >
            <Icon
              className={cn("size-5 mb-0.5", isActive && "fill-current/10")}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={cn(
                "text-[10px] tracking-wide",
                isActive ? "font-bold" : "font-semibold",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
