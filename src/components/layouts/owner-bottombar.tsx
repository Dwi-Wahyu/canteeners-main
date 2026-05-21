"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ChartNoAxesCombined,
  Home,
  MessageCircle,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
import { useTotalUnreadChatCount } from "@/features/chat/hooks/use-total-unread-chat-count";
import { useUnreadNotificationCount } from "@/features/notification/hooks/use-unread-notification-count";

export default function OwnerBottomBar() {
  const currentPathname = usePathname();
  const unreadChatCount = useTotalUnreadChatCount();
  const unreadNotificationCount = useUnreadNotificationCount();

  const navItems = [
    {
      href: "/dashboard-kedai",
      icon: Home,
      activeIcon: Home,
      label: "Beranda",
      exact: true,
    },
    {
      href: "/dashboard-kedai/chat",
      icon: MessageCircle,
      activeIcon: MessageCircle,
      label: "Chat",
      exact: false,
    },
    {
      href: "/dashboard-kedai/produk",
      icon: UtensilsCrossed,
      activeIcon: UtensilsCrossed,
      label: "Produk",
      exact: false,
    },
    {
      href: "/dashboard-kedai/performa",
      icon: ChartNoAxesCombined,
      activeIcon: ChartNoAxesCombined,
      label: "Performa",
      exact: false,
    },
    {
      href: "/dashboard-kedai/pengaturan",
      icon: Settings,
      activeIcon: Settings,
      label: "Pengaturan",
      exact: false,
    },
  ];

  const checkActive = (href: string, exact: boolean) => {
    if (exact) {
      return currentPathname === href;
    }
    return currentPathname.startsWith(href);
  };

  return (
    <div className="w-full bg-secondary border-t p-4 pb-4 fixed bottom-0 left-0 z-50 flex justify-evenly items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = checkActive(item.href, item.exact);

        const IconComponent = isActive ? item.activeIcon : item.icon;
        const isChat = item.label === "Chat";
        // const isHome = item.label === "Beranda";

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`
              flex flex-col items-center justify-center p-2 transition-all duration-200 relative
              ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <IconComponent className="w-6 h-6" />
            {isChat && unreadChatCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-sm">
                {unreadChatCount > 99 ? "99+" : unreadChatCount}
              </span>
            )}
            {item.label === "Beranda" && unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
