"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useUnreadNotificationCount } from "@/features/notification/hooks/use-unread-notification-count";
import { Button } from "@/components/ui/button";

export function DashboardNotificationButton() {
  const unreadNotificationCount = useUnreadNotificationCount();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full focus:scale-105 transition-transform"
      asChild
    >
      <Link href="/dashboard-kedai/notifikasi">
        <Bell className="w-6 h-6" />
        {unreadNotificationCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
