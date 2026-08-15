"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function PaymentCountdown({
  confirmedAt,
  orderId,
  timeoutMinutes = 15,
}: {
  confirmedAt: Date;
  orderId: string;
  timeoutMinutes?: number;
}) {
  const [timeLeft, setTimeLeft] = useState<string>("15:00");

  useEffect(() => {
    const startTime = new Date(confirmedAt).getTime();
    const endTime = startTime + timeoutMinutes * 60 * 1000;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        return;
      }

      const mins = Math.floor(diff / 1000 / 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft(
        `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [confirmedAt, timeoutMinutes]);

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
      <Clock className="w-4 h-4 text-amber-600" />
      <span className="text-sm font-medium">Batas Waktu Pembayaran:</span>
      <span className="text-base font-bold tabular-nums text-amber-700">
        {timeLeft}
      </span>
    </div>
  );
}
