"use client";

import { auth, db } from "@/lib/firebase/client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  writeBatch,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { AppNotification } from "../types";

const PAGE_SIZE = 20;

export const useNotificationListPaginated = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsFirebaseLoading(false);

      if (status === "authenticated" && !session?.user?.firebaseToken) {
        setIsFirebaseLoading(false);
      }
    });
    return () => unsubscribe();
  }, [status, session?.user?.firebaseToken]);

  useEffect(() => {
    if (!user) {
      if (status !== "loading") setIsFirebaseLoading(false);
      return;
    }

    setNotifications([]);
    setHasMore(true);
    lastDocRef.current = null;
    setError(null);

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("recipientId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AppNotification[];

        setNotifications(results);

        if (snapshot.docs.length > 0) {
          lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
        }

        setHasMore(snapshot.docs.length === PAGE_SIZE);
      },
      (err) => {
        console.error("❌ Firestore notification error:", err);
        if (err.message.includes("index")) {
          setError(
            "Firestore index required. Check console for the index creation link."
          );
        } else {
          setError(`Error loading notifications: ${err.message}`);
        }
      }
    );

    unsubscribeRef.current = unsubscribe;
    return () => unsubscribe();
  }, [user, status]);

  const loadMore = useCallback(async () => {
    if (!user || !lastDocRef.current || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("recipientId", "==", user.uid),
      orderBy("createdAt", "desc"),
      startAfter(lastDocRef.current),
      limit(PAGE_SIZE)
    );

    const { getDocs } = await import("firebase/firestore");
    
    try {
      const snapshot = await getDocs(q);
      const newNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AppNotification[];

      setNotifications((prev) => {
        const existingIds = new Set(prev.map(p => p.id));
        const filteredNew = newNotifications.filter(n => !existingIds.has(n.id));
        return [...prev, ...filteredNew];
      });

      if (snapshot.docs.length > 0) {
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
      }

      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error loading more notifications:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [user, isLoadingMore, hasMore]);

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length === 0) return;

    setIsMarkingRead(true);
    const batch = writeBatch(db);
    unreadNotifications.forEach((n) => {
      const notificationRef = doc(db, "notifications", n.id);
      batch.update(notificationRef, { isRead: true });
    });

    try {
      await batch.commit();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const isLoading =
    status === "loading" || (status === "authenticated" && isFirebaseLoading);

  return { isLoading, isLoadingMore, notifications, user, loadMore, hasMore, error, markAllAsRead, isMarkingRead, deleteNotification };
};
