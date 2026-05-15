"use client";

import { getOrderDetail } from "@/features/order/lib/order-queries";
import { GetOrderDetail } from "@/features/order/types/order-queries-types";
import { db } from "@/lib/firebase/client";
import { useQuery } from "@tanstack/react-query";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { useEffect, useRef } from "react";

type UseWatchOrderUpdateReturn = {
  orderData: GetOrderDetail | null;
  loading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
};

export function useWatchOrderUpdate(
  order_id: string,
): UseWatchOrderUpdateReturn {
  const lastKnownUpdate = useRef<number>(0);

  const {
    data: orderData,
    isLoading: queryLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order-detail", order_id],
    queryFn: () => getOrderDetail(order_id),
    enabled: !!order_id,
    staleTime: 0, // agar selalu anggap data bisa outdated
    gcTime: 1000 * 60 * 5, // 5 menit
  });

  // Listener ke Firestore untuk trigger timestamp
  useEffect(() => {
    if (!order_id) return;

    const orderRef = doc(db, "orders", order_id);

    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          // Dokumen dihapus (order selesai/batal/ditolak)
          // Paksa refetch dari DB utama untuk mendapatkan status final
          refetch();
          return;
        }

        const data = snapshot.data();
        const timestamp = (data?.lastUpdatedTimestamp ||
          data?.lastUpdatedAt) as Timestamp | undefined;

        if (!timestamp) return;

        const updateMillis = timestamp.toMillis();

        if (lastKnownUpdate.current === 0) {
          lastKnownUpdate.current = updateMillis;
          return;
        }

        if (updateMillis > lastKnownUpdate.current) {
          lastKnownUpdate.current = updateMillis;
          refetch();
        }
      },
      (err) => {
        // Jika error karena permission denied saat dokumen dihapus, itu normal
        if (err.code === "permission-denied") {
          refetch();
        } else {
          console.error("Firestore onSnapshot error:", err);
        }
      },
    );

    return () => unsubscribe();
  }, [order_id, refetch]);

  const loading = queryLoading || isFetching;

  return {
    orderData: orderData ?? null,
    loading,
    isFetching,
    error,
    refetch,
  };
}
