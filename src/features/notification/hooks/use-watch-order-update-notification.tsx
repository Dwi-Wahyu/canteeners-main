"use client";

import { useSocket } from "@/lib/realtime/socket-context";
import { useEffect } from "react";
import { toast } from "sonner";
import { OrderNotification } from "../types";
import { OrderNotificationToast } from "../ui/order-notification-toast";

export const useWatchOrderUpdateNotification = (uid: string | null) => {
  const socket = useSocket();

  useEffect(() => {
    if (!uid || !socket) return;

    const unsubscribe = socket.on("notification", (data: any) => {
      const notification = data.notification || data;
      if (notification && notification.type === "ORDER") {
        toast.custom((id) => (
          <OrderNotificationToast
            notification={notification as OrderNotification}
            onDismiss={() => toast.dismiss(id)}
          />
        ));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [uid, socket]);

  return null;
};
