"use client";

import { db } from "@/lib/firebase/client";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetRefundById } from "@/features/shop/refund/types/refund-queries-types";
import { getRefundById } from "@/features/shop/refund/lib/refund-queries";
import { useRouter } from "next/navigation";
import { RefundStatus } from "@/generated/prisma";

type UseWatchRefundUpdateReturn = {
  refundData: GetRefundById | null;
  loading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
};

/**
 * Hook to listen for realtime refund status changes via Firestore.
 * Uses a ref to track the last seen timestamp to prevent infinite loops.
 */
export function useWatchRefundUpdate(
  refundId: string | null | undefined,
  initialData?: GetRefundById,
): UseWatchRefundUpdateReturn {
  const router = useRouter();
  const lastKnownUpdate = useRef<number>(0);
  const [firestoreStatus, setFirestoreStatus] = useState<RefundStatus | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    data: sqlData,
    isLoading: queryLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["refund-detail", refundId],
    queryFn: () => getRefundById(refundId!),
    enabled: !!refundId,
    initialData: initialData,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!refundId) return;

    const refundRef = doc(db, "refunds", refundId);

    const unsubscribe = onSnapshot(
      refundRef,
      (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        const status = data?.status as RefundStatus;
        const timestamp = data?.lastUpdatedAt as Timestamp | undefined;

        if (status) {
          setFirestoreStatus(status);
        }

        if (!timestamp) return;

        const updateMillis = timestamp.toMillis();

        // Initialize ref on first run
        if (lastKnownUpdate.current === 0) {
          lastKnownUpdate.current = updateMillis;
          return;
        }

        // Only trigger refetch if there's a NEW update in Firestore
        if (updateMillis > lastKnownUpdate.current) {
          lastKnownUpdate.current = updateMillis;
          refetch().then(() => {
            router.refresh();
          });
        }
      },
      (err) => {
        if (err.code !== "permission-denied") {
          console.error("Firestore refund onSnapshot error:", err);
        }
      },
    );

    return () => unsubscribe();
  }, [refundId, refetch, router]); // Removed sqlData dependencies to prevent loops

  // Merge Firestore status if not COMPLETED in SQL
  // This allows the UI to update immediately while SQL is refetching
  const mergedData =
    isMounted && sqlData && firestoreStatus && sqlData.status !== "COMPLETED"
      ? { ...sqlData, status: firestoreStatus }
      : sqlData || initialData;

  return {
    refundData: (mergedData as GetRefundById) ?? null,
    loading: queryLoading,
    isFetching,
    error,
    refetch,
  };
}
