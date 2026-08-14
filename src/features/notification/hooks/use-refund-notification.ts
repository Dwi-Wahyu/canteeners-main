import { useEffect, useState, useRef } from "react";
import { RefundNotification } from "../types";
import { useSocket } from "@/lib/realtime/socket-context";

export const useRefundNotification = (options?: {
  onNewNotification?: (notification: RefundNotification) => void;
}) => {
  const [notifications, setNotifications] = useState<RefundNotification[]>([]);
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
      if (notif && notif.type === "REFUND") {
        setNotifications((prev) => [notif as RefundNotification, ...prev]);
        contentRef.current?.(notif as RefundNotification);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [socket]);

  return { notifications, loading };
};
