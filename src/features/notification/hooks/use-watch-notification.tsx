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
} from "../types";
import { useNotificationDialogStore } from "@/stores/use-notification-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function useWatchNotification() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFirstRun = useRef(true);
  const showNotification = useNotificationDialogStore((state) => state.show);
  const hideNotification = useNotificationDialogStore((state) => state.hide);
  const router = useRouter();

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

      if (snapshot.empty) return;

      const data = snapshot.docs[0].data() as AppNotification;

      // Handle sound for new orders
      if (data.type === "ORDER" && data.subType === "CREATED") {
        const audio = new Audio("/sounds/pesanan-masuk.mp3");
        audio.play().catch((err) => console.error("Error playing sound:", err));
      }

      // Handle sound for payment proof submission
      if (data.type === "ORDER" && data.subType === "PAYMENT_PROOF_SUBMITTED") {
        const audio = new Audio("/sounds/bukti-pembayaran-masuk.mp3");
        audio.play().catch((err) => console.error("Error playing sound:", err));
      }

      // Handle sound for refund request
      if (data.type === "REFUND" && data.subType === "REQUESTED") {
        const audio = new Audio("/sounds/ada-refund-pelanggan.mp3");
        audio.play().catch((err) => console.error("Error playing sound:", err));
      }

      // Skip dialog for completed refunds as requested
      if (data.type === "REFUND" && data.subType === "COMPLETED") {
        return;
      }

      showNotification({
        title: data.title,
        message: data.body,
        type: data.type === "ORDER" ? "success" : data.type === "COMPLAINT" ? "error" : "info",
        duration: 5000,
        showLoadingBar: true,
        actionButtons: (
          <Button
            onClick={() => {
              if (data.type === "ORDER") {
                router.push("/dashboard-kedai/order");
              } else {
                router.push(data.resourcePath);
              }
              hideNotification();
            }}
            className="w-full"
          >
            Lihat Detail
          </Button>
        ),
      });
    });

    return () => {
      unsubscribe();
      isFirstRun.current = true;
    };
  }, [user, showNotification, hideNotification, router]);

  return null;
}
