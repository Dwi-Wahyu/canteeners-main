"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { timeoutCancelOrder } from "@/features/order/lib/order-actions";
import { useRouter } from "next/navigation";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { Timer } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { getPaymentTimeoutAction } from "./actions";

export default function PaymentCountdown({
  confirmedAt,
  orderId,
}: {
  confirmedAt: Date | string;
  orderId: string;
}) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeoutMinutes, setTimeoutMinutes] = useState<number | null>(null);

  // Fetch dynamic timeout duration
  useEffect(() => {
    const fetchTimeout = async () => {
      const minutes = await getPaymentTimeoutAction();
      setTimeoutMinutes(minutes);
    };
    fetchTimeout();
  }, []);

  // Firestore Sync - Auto reload if status changes to CANCELLED (e.g. from worker)
  useEffect(() => {
    const orderRef = doc(db, "orders", orderId);

    const unsubscribe = onSnapshot(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.status === "CANCELLED") {
          // Trigger refresh to update server-side state of the page
          router.refresh();
        }
      }
    });

    return () => unsubscribe();
  }, [orderId, router]);

  // Countdown Timer Logic
  useEffect(() => {
    if (timeoutMinutes === null) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const confirmedTime = new Date(confirmedAt).getTime();
      const timeoutMillis = timeoutMinutes * 60 * 1000;
      const difference = confirmedTime + timeoutMillis - now;

      if (difference <= 0) {
        return 0;
      }
      return Math.floor(difference / 1000);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(async () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        // Panggil server action untuk membatalkan order
        const result = await timeoutCancelOrder({ order_id: orderId });

        if (result.success) {
          notificationDialog.error({
            title: "Waktu Habis",
            message:
              "Waktu pembayaran telah habis. Pesanan dibatalkan otomatis.",
          });
          router.replace("/order/" + orderId);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [confirmedAt, orderId, router, timeoutMinutes]);

  if (timeLeft === null) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Alert
      variant={timeLeft < 60 ? "destructive" : "default"}
      className="animate-pulse flex flex-col gap-1"
    >
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4" />
        <AlertTitle className="mb-0">Batas Waktu Pembayaran</AlertTitle>
      </div>
      <AlertDescription className="font-mono text-2xl font-bold">
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </AlertDescription>
    </Alert>
  );
}
