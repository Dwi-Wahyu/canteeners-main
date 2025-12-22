import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentChange,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase/client";
import { ChatNotification } from "../types";

export const useChatNotification = (options?: {
  onNewNotification?: (notification: ChatNotification) => void;
}) => {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const contentRef = useRef(options?.onNewNotification);

  useEffect(() => {
    contentRef.current = options?.onNewNotification;
  }, [options?.onNewNotification]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("recipientId", "==", user.uid),
      where("type", "==", "CHAT"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Handle changes for toast
        if (contentRef.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              // Only trigger if it's a "fresh" added event (not initial load of existing docs)
              // Checking if metadata.fromCache or similar might help,
              // but often initial load has a lot of "added".
              // A simple way to avoid initial flood is to check if we are already loaded or check timestamp.
              // However, typically snapshop.docChanges() contains all on first run.
              // We can filter by checking if the notification time is very recent.

              const data = change.doc.data() as ChatNotification;
              // Check if created within last 10 seconds? Or just use a flag?
              // Another common trick: ignore changes on first emission?
              // React Query uses a flag.
              // Let's rely on the consumer or just checking if it is indeed new.

              // For now, let's pass it through and let the UI decide, OR enforce "is new" check.
              // But real-time added event IS new in most contexts unless it's the initial hydration.

              // Simplest approach for "Toaster":
              // We don't want to toast 100 things on page reload.
              // We can check `snapshot.metadata.hasPendingWrites`? No.

              // Logic: Timestamp check. If created < 5 seconds ago.
              const now = Date.now();
              const createdAt = new Date(data.createdAt.toDate()).getTime();
              // If it's somewhat fresh (e.g. within last 30 seconds to account for clock skew/latency)
              if (now - createdAt < 30000) {
                contentRef.current?.({ ...data, id: change.doc.id });
              }
            }
          });
        }

        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatNotification[];

        setNotifications(results);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching chat notifications:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { notifications, loading };
};
