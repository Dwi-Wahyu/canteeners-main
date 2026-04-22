"use client";

import { useEffect, useState, useCallback } from "react";

export default function OrderEstimationCountDown({
  estimation,
  processed_at,
}: {
  estimation: number;
  processed_at: Date;
}) {
  const calculateTimeLeft = useCallback(() => {
    const processedTime = new Date(processed_at).getTime();
    const endTime = processedTime + estimation * 60000;
    const now = new Date().getTime();
    const difference = endTime - now;

    if (difference <= 0) {
      return "00:00";
    }

    const minutes = Math.floor(difference / 1000 / 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [estimation, processed_at]);

  const [timeLeft, setTimeLeft] = useState<string>(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return <h1 className="text-lg font-bold text-primary">{timeLeft}</h1>;
}
