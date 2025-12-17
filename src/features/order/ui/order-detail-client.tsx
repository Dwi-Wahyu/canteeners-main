"use client";

import { db } from "@/lib/firebase/client";
import { useQuery } from "@tanstack/react-query";
import { getAuth, User } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { getOrderDetail } from "../lib/order-queries";
import { toast } from "sonner";

type OrderData = {
  id: string;
  lastUpdatedTimestamp: Timestamp;
};

export function OrderDetailClient({ order_id }: { order_id: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>();

  const { data, isFetching, error, isError, refetch } = useQuery({
    queryKey: ["order-detail", order_id],
    queryFn: async () => {
      return getOrderDetail(order_id);
    },
  });

  // Timestamp terakhir kali fetch
  const lastKnownUpdate = useRef<number>(0);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const orderRef = collection(db, "orders");

    const q = query(orderRef, where("id", "==", order_id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.docs.length === 0) {
          throw Error("Order not found");
        }

        const data = snapshot.docs[0].data() as OrderData;

        const firestoreUpdateMillis = data.lastUpdatedTimestamp.toMillis();

        if (firestoreUpdateMillis > lastKnownUpdate.current) {
          // Update ref
          lastKnownUpdate.current = firestoreUpdateMillis;

          toast.info("Terjadi perubahan detail order");

          // Refetch data utama
          refetch();
        }

        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [order_id, refetch]);

  if (loading) {
    return <div className="p-4 text-center">Memuat data order...</div>;
  }

  return (
    <div>
      <h1>{order_id}</h1>
    </div>
  );
}
