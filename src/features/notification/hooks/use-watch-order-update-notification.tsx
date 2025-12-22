import { db } from "@/lib/firebase/client";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { OrderNotification } from "../types";
import { OrderNotificationToast } from "../ui/order-notification-toast";

export const useWatchOrderUpdateNotification = (uid: string | null) => {
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!uid) {
      return;
    }

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("recipientId", "==", uid),
      where("type", "==", "ORDER"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Jika ini adalah snapshot pertama kali dari server, tandai dan abaikan
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }

      // Pastikan data bukan berasal dari cache lokal (Metadata check)
      // agar tidak double-toast saat offline-to-online
      if (querySnapshot.metadata.hasPendingWrites) return;

      if (!querySnapshot.empty) {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const notification = change.doc.data() as OrderNotification;

            toast.custom((id) => (
              <OrderNotificationToast
                notification={notification}
                onDismiss={() => toast.dismiss(id)}
              />
            ));
          }
        });
      }
    });

    return () => {
      unsubscribe();
      isFirstRun.current = true;
    };
  }, [uid]);

  return null;
};
