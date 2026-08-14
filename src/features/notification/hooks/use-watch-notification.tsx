"use client";

import { useSocket } from "@/lib/realtime/socket-context";
import { useEffect } from "react";
import {
  AppNotification,
  ComplaintNotification,
  OrderNotification,
  RefundNotification,
} from "../types";
import { toast } from "sonner";
import { OrderNotificationToast } from "../ui/order-notification-toast";
import { ComplaintNotificationToast } from "../ui/complaint-notification-toast";
import { RefundNotificationToast } from "../ui/refund-notification-toast";

export default function useWatchNotification() {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const unsubscribe = socket.on("notification", (data: any) => {
      const notification = data.notification || data;

      if (notification.type === "ORDER") {
        if (
          notification.subtype === "CREATED" ||
          notification.subType === "CREATED"
        ) {
          const audio = new Audio("/sounds/pesanan-masuk.mp3");
          audio
            .play()
            .catch((err) => console.error("Error playing sound:", err));
        }

        toast.custom((id) => (
          <OrderNotificationToast
            notification={notification as OrderNotification}
            onDismiss={() => toast.dismiss(id)}
          />
        ));
      }

      if (notification.type === "COMPLAINT") {
        toast.custom((id) => (
          <ComplaintNotificationToast
            notification={notification as ComplaintNotification}
            onDismiss={() => toast.dismiss(id)}
          />
        ));
      }

      if (notification.type === "REFUND") {
        toast.custom((id) => (
          <RefundNotificationToast
            notification={notification as RefundNotification}
            onDismiss={() => toast.dismiss(id)}
          />
        ));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [socket]);

  return null;
}
