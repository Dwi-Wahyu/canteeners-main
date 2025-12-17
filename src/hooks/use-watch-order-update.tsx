"use client";

import { getOrderDetail } from "@/features/order/lib/order-queries";
import { GetOrderDetail } from "@/features/order/types/order-queries-types";
import { db } from "@/lib/firebase/client";
import { useQuery } from "@tanstack/react-query";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

type UseWatchOrderUpdateReturn = {
  orderData: GetOrderDetail | null;
  loading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
};

export function useWatchOrderUpdate(
  order_id: string
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
          toast.error("Order tidak ditemukan di Firestore");
          return;
        }

        const data = snapshot.data();
        const timestamp = data?.lastUpdatedTimestamp as Timestamp | undefined;

        if (!timestamp) return;

        const updateMillis = timestamp.toMillis();

        // Jika timestamp besar berarti ada perubahan
        // Handle ketika pertama kali fetch tidak perlu update
        if (updateMillis > lastKnownUpdate.current) {
          lastKnownUpdate.current = updateMillis;

          // toast.info("Order diperbarui!");

          refetch();
        }
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
      }
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
