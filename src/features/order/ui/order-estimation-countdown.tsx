"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export default function OrderEstimationCountDown({
  estimation,
  processed_at,
  userRole = "CUSTOMER",
  onFinished,
}: {
  estimation: number;
  processed_at: Date;
  userRole?: "CUSTOMER" | "SHOP_OWNER";
  onFinished?: () => void;
}) {
  const calculateTimeLeft = useCallback(() => {
    const processedTime = new Date(processed_at).getTime();
    const endTime = processedTime + estimation * 60000;
    const now = new Date().getTime();
    const difference = endTime - now;

    if (difference <= 0) {
      return null;
    }

    const minutes = Math.floor(difference / 1000 / 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [estimation, processed_at]);

  const [timeLeft, setTimeLeft] = useState<string | null>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const current = calculateTimeLeft();
      setTimeLeft(current);
      if (current === null && onFinished) {
        onFinished();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, onFinished]);

  if (timeLeft === null) {
    if (userRole === "SHOP_OWNER") {
      return (
        <h1 className="text-sm font-bold text-destructive animate-pulse bg-red-50 px-3 py-1 rounded-full border border-red-100">
          Segera Selesaikan Pesanan!
        </h1>
      );
    }
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-lg font-bold text-primary tabular-nums tracking-tight">
        {timeLeft}
      </h1>
      <span className="text-[10px] font-bold text-muted-foreground uppercase bg-gray-100 px-2 py-0.5 rounded">
        Sisa Waktu
      </span>
    </div>
  );
}
