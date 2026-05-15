"use client";

import { db } from "@/lib/firebase/client";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook untuk mendengarkan perubahan realtime status refund via Firestore.
 * Saat Firestore mendeteksi perubahan, hook ini invalidate query refund
 * agar data terbaru di-fetch dari PostgreSQL.
 *
 * Pola identik dengan useWatchOrderUpdate.
 */
export function useWatchRefundUpdate(
  refundId: string | null | undefined,
  queryKeyToInvalidate: unknown[],
): void {
  const queryClient = useQueryClient();
  const lastKnownUpdate = useRef<number>(0);

  useEffect(() => {
    if (!refundId) return;

    const refundRef = doc(db, "refunds", refundId);

    const unsubscribe = onSnapshot(
      refundRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          // Dokumen tidak ada (bisa terjadi setelah CANCELLED/COMPLETED lama)
          return;
        }

        const data = snapshot.data();
        const timestamp = data?.lastUpdatedAt as Timestamp | undefined;

        if (!timestamp) return;

        const updateMillis = timestamp.toMillis();

        if (lastKnownUpdate.current === 0) {
          lastKnownUpdate.current = updateMillis;
          return;
        }

        if (updateMillis > lastKnownUpdate.current) {
          lastKnownUpdate.current = updateMillis;
          // Invalidate query — paksa refetch data dari PostgreSQL
          queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
        }
      },
      (err) => {
        if (err.code === "permission-denied") {
          // Normal jika user tidak punya akses ke doc ini
          return;
        }
        console.error("Firestore refund onSnapshot error:", err);
      },
    );

    return () => unsubscribe();
  }, [refundId, queryClient, queryKeyToInvalidate]);
}
