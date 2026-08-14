"use client";

import { getOrderDetail } from "@/features/order/lib/order-queries";
import { GetOrderDetail } from "@/features/order/types/order-queries-types";
import { useSocket } from "@/lib/realtime/socket-context";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

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
  const socket = useSocket();

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
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!order_id || !socket) return;

    const topic = `order:${order_id}`;
    socket.join(topic);

    const unsubscribe = socket.on("order:update", () => {
      refetch();
    });

    return () => {
      socket.leave(topic);
      unsubscribe();
    };
  }, [order_id, socket, refetch]);

  const loading = queryLoading || isFetching;

  return {
    orderData: orderData ?? null,
    loading,
    isFetching,
    error,
    refetch,
  };
}
