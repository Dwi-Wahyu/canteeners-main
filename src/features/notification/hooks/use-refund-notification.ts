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
import { RefundNotification } from "../types";

export const useRefundNotification = (options?: {
    onNewNotification?: (notification: RefundNotification) => void;
  }) => {
  const [notifications, setNotifications] = useState<RefundNotification[]>([]);
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
      where("type", "==", "REFUND"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (contentRef.current) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                const data = change.doc.data() as RefundNotification;
                const now = Date.now();
                const createdAt = new Date(data.createdAt).getTime();
                if (now - createdAt < 30000) {
                    contentRef.current?.({ ...data, id: change.doc.id });
                }
              }
            });
          }

        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RefundNotification[];

        setNotifications(results);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching refund notifications:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { notifications, loading };
};
