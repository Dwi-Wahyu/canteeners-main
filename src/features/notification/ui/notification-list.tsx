"use client";

import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { NotificationBase } from "../types";
import { db } from "@/lib/firebase/client";
import Link from "next/link";

export default function NotificationList({ uid }: { uid: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cek Status Login (Anonymous)
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid) {
      return;
    }

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("recipientId", "==", uid),
      where("type", "!=", "CHAT"),
      orderBy("type"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NotificationBase[];

      setNotifications(docs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {notifications.length === 0 ? (
        <p>Tidak ada notifikasi.</p>
      ) : (
        notifications.map((notification) => (
          <Link href={notification.resourcePath} key={notification.id}>
            <h1>{notification.title}</h1>
          </Link>
        ))
      )}
    </div>
  );
}
