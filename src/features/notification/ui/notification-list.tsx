"use client";

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AppNotification, NotificationBase } from "../types";
import { db } from "@/lib/firebase/client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  MessageSquare,
  ShoppingCart,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function NotificationList({ uid }: { uid: string }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      return;
    }

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("recipientId", "==", uid),
      // where("type", "!=", "CHAT"), // You can uncomment this if you want to hide chat notifications
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AppNotification[];

      setNotifications(docs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case "CHAT":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "REFUND":
        return <RefreshCcw className="h-5 w-5 text-orange-500" />;
      case "COMPLAINT":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Belum ada notifikasi.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        // Handle Firestore Timestamp to Date conversion safely
        const date = notification.createdAt?.toDate
          ? notification.createdAt.toDate()
          : new Date();

        return (
          <Link
            href={notification.resourcePath || "#"}
            key={notification.id}
            className="block"
          >
            <Card
              className={`hover:bg-muted/50 transition-colors ${
                !notification.isRead ? "border-l-4 border-l-primary" : ""
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
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(date, {
                        addSuffix: true,
                        locale: id,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.body}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                      {notification.type}
                    </Badge>
                    {/* Optional: Add subtype badge if needed */}
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
