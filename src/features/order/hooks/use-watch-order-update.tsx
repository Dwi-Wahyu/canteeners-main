import { db } from "@/lib/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const useWatchOrderUpdate = (orderId: string) => {
  const isFirstRun = useRef(true);

  const router = useRouter();

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const orderRef = doc(db, "orders", orderId);

    const unsubscribe = onSnapshot(orderRef, (querySnapshot) => {
      // Jika ini adalah snapshot pertama kali dari server, tandai dan abaikan
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }

      // Pastikan data bukan berasal dari cache lokal (Metadata check)
      // agar tidak double-toast saat offline-to-online
      if (querySnapshot.metadata.hasPendingWrites) return;

      if (!querySnapshot.exists()) {
        return;
      }

      toast.info("Order diperbarui");
      router.refresh();
    });

    return () => {
      unsubscribe();
      isFirstRun.current = true;
    };
  }, [orderId]);
};
