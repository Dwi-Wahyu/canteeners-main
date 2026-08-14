"use client";

import { useEffect, useState } from "react";
import { AppNotification } from "../types";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, ShoppingCart, RefreshCcw, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useSocket } from "@/lib/realtime/socket-context";
import { useSession } from "next-auth/react";

export default function NotificationList() {
  const { data: session, status } = useSession();
  const socket = useSocket();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (!socket) return;

    const unsubscribe = socket.on("notification", (data: any) => {
      const notif = data.notification || data;
      if (notif) {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notif.id)) return prev;
          return [notif as AppNotification, ...prev];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [socket]);

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case "REFUND":
        return <RefreshCcw className="h-5 w-5 text-orange-500" />;
      case "COMPLAINT":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const parseDate = (raw: any): Date => {
    if (!raw) return new Date();
    if (typeof raw === "object" && typeof raw.toDate === "function") {
      return raw.toDate();
    }
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Belum ada notifikasi.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const date = parseDate(notification.createdAt || notification.created_at);
        const targetPath =
          notification.resourcePath ||
          (notification.data as any)?.resourcePath ||
          "#";

        return (
          <Link
            href={targetPath}
            key={notification.id}
            className="block"
          >
            <Card
              className={`hover:bg-muted/50 transition-colors ${
                !(notification.isRead || notification.is_read)
                  ? "border-l-4 border-l-primary"
                  : ""
              }`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1 bg-background p-2 rounded-full border shadow-sm">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">
                      {notification.title}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.body}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Badge variant="outline" className="h-5 px-1.5 text-xs">
                      {formatDistanceToNow(date, {
                        addSuffix: true,
                        locale: localeId,
                      })}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
