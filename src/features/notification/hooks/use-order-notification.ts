import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase/client";
import { OrderNotification } from "../types";

export const useOrderNotification = (options?: {
    onNewNotification?: (notification: OrderNotification) => void;
  }) => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
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
      where("type", "==", "ORDER"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (contentRef.current) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                const data = change.doc.data() as OrderNotification;
                const now = Date.now();
                const createdAt = new Date(data.createdAt).getTime();
                // 30 seconds threshold for "new"
                if (now - createdAt < 30000) {
                    contentRef.current?.({ ...data, id: change.doc.id });
                }
              }
            });
          }

        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as OrderNotification[];

        setNotifications(results);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching order notifications:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { notifications, loading };
};
