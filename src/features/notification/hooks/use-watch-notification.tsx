"use client";

import { db } from "@/lib/firebase/client";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFirstRun = useRef(true);

  // Cek Status Login
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const chatsRef = collection(db, "notifications");

    // nanti batasi 20 dokumen terakhir untuk hemat free tier
    const q = query(
      chatsRef,
      where("recipientId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }

      const data = snapshot.docs[0].data() as AppNotification;

      if (data.type === "ORDER") {
        toast.custom((id) => (
          <OrderNotificationToast
            notification={data as OrderNotification}
            onDismiss={() => toast.dismiss(id)}
          />
        ));
      }

      if (data.type === "COMPLAINT") {
        toast.custom((id) => (
          <ComplaintNotificationToast
            notification={data as ComplaintNotification}
            onDismiss={() => toast.dismiss(id)}
          />
        ));
      }

      if (data.type === "REFUND") {
        toast.custom((id) => (
          <RefundNotificationToast
            notification={data as RefundNotification}
            onDismiss={() => toast.dismiss(id)}
          />
        ));
      }
    });

    return () => {
      unsubscribe();
      isFirstRun.current = true;
    };
  }, [user]);

  return null;
}
