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
import { AppNotification } from "../types";
import { useNotificationDialogStore } from "@/stores/use-notification-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function useWatchNotification() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFirstRun = useRef(true);
  const seenNotificationIds = useRef<Set<string>>(new Set());
  const listenerStartTime = useRef<number>(Date.now());
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
      limit(1),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstRun.current) {
        snapshot.docs.forEach((doc) => {
          seenNotificationIds.current.add(doc.id);
        });
        isFirstRun.current = false;
        return;
      }

      if (snapshot.empty) return;

      const addedChange = snapshot.docChanges().find((change) => change.type === "added");
      if (!addedChange) return;

      const docId = addedChange.doc.id;
      if (seenNotificationIds.current.has(docId)) return;

      const data = addedChange.doc.data() as AppNotification;
      const createdAtMillis = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();

      // Ignore notifications that were created before the listener started
      if (createdAtMillis < listenerStartTime.current - 10000) {
        seenNotificationIds.current.add(docId);
        return;
      }

      // Mark as seen
      seenNotificationIds.current.add(docId);

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

      showNotification({
        title: data.title,
        message: data.body,
        type:
          data.type === "ORDER"
            ? "success"
            : data.type === "COMPLAINT"
              ? "error"
              : "info",
        duration: data.duration !== undefined ? data.duration : 5000,
        showLoadingBar:
          data.showLoadingBar !== undefined ? data.showLoadingBar : true,
        actionButtons: (
          <div className="flex flex-col gap-2 w-full">
            {data.buttons && data.buttons.length > 0 ? (
              data.buttons.map((btn, idx) => (
                <Button
                  key={idx}
                  variant={btn.variant as any}
                  onClick={() => {
                    router.push(btn.actionPath);
                    hideNotification();
                  }}
                  className="w-full"
                >
                  {btn.label}
                </Button>
              ))
            ) : (
              <Button
                onClick={() => {
                  if (data.resourcePath) {
                    router.push(data.resourcePath);
                  } else if (data.type === "ORDER") {
                    router.push("/dashboard-kedai/order");
                  } else {
                    router.push("/");
                  }
                  hideNotification();
                }}
                className="w-full"
              >
                Lihat Detail
              </Button>
            )}
          </div>
        ),
      });
    });

    return () => {
      unsubscribe();
      seenNotificationIds.current.clear();
      listenerStartTime.current = Date.now();
      isFirstRun.current = true;
    };
  }, [user, showNotification, hideNotification, router]);

  return null;
}
