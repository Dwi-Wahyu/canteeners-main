"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Keranjang",
    href: "/keranjang",
    icon: "shopping_bag",
  },
  {
    label: "Chat",
    href: "/chat",
    icon: "chat",
  },
  {
    label: "Home",
    href: "/kantin",
    icon: "home",
    isMain: true,
  },
  {
    label: "Riwayat",
    href: "/order",
    icon: "history",
  },
  {
    label: "Profil",
    href: "/profil",
    icon: "person",
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

        if (item.isMain) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-10 transition-all active:scale-95"
              aria-label={item.label}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #b70011 0%, #dc2626 100%)",
                  boxShadow: "0 6px 24px rgba(220,38,38,0.4)",
                }}
              >
                <span
                  className="material-symbols-outlined text-white"
                  style={{
                    fontSize: 26,
                    fontVariationSettings: isActive ? "'FILL' 1" : "none",
                  }}
                >
                  {item.icon}
                </span>
              </div>
              <span
                className="text-[10px] font-bold tracking-wide mt-1"
                style={{ color: "#DC2626" }}
              >
                {item.label}
              </span>
            </Link>
          );
        }

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
            <span
              className="material-symbols-outlined mb-0.5"
              style={{
                fontSize: 22,
                fontVariationSettings: isActive ? "'FILL' 1" : "none",
              }}
            >
              {item.icon}
            </span>
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
