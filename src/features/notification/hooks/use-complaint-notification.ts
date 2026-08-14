import { useEffect, useState, useRef } from "react";
import { ComplaintNotification } from "../types";
import { useSocket } from "@/lib/realtime/socket-context";

export const useComplaintNotification = (options?: {
  onNewNotification?: (notification: ComplaintNotification) => void;
}) => {
  const [notifications, setNotifications] = useState<ComplaintNotification[]>([]);
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
      if (notif && notif.type === "COMPLAINT") {
        setNotifications((prev) => [notif as ComplaintNotification, ...prev]);
        contentRef.current?.(notif as ComplaintNotification);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [socket]);

  return { notifications, loading };
};
