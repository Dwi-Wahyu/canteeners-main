import { useEffect, useState, useRef } from "react";
import { OrderNotification } from "../types";
import { useSocket } from "@/lib/realtime/socket-context";

export const useOrderNotification = (options?: {
  onNewNotification?: (notification: OrderNotification) => void;
}) => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const contentRef = useRef(options?.onNewNotification);

  useEffect(() => {
    contentRef.current = options?.onNewNotification;
  }, [options?.onNewNotification]);

  useEffect(() => {
    if (!socket) return;

    const unsubscribe = socket.on("notification", (data: any) => {
      const notif = data.notification || data;
      if (notif && notif.type === "ORDER") {
        setNotifications((prev) => [notif as OrderNotification, ...prev]);
        contentRef.current?.(notif as OrderNotification);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [socket]);

  return { notifications, loading };
};
