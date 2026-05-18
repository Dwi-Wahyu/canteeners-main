// features/chat/hooks/use-chat-list-paginated.ts
import { auth, db } from "@/lib/firebase/client";
import { Chat } from "../types";
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
} from "firebase/firestore";

const PAGE_SIZE = 20; // Jumlah chat per halaman

export const useChatListPaginated = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Simpan cursor (doc terakhir) untuk pagination
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  // Simpan unsubscribe function listener aktif
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Cek status login Firebase (tidak berubah dari hook lama)
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

  // Load halaman pertama dengan realtime listener
  useEffect(() => {
    if (!user) return;

    // Reset state saat user berubah
    setChats([]);
    setHasMore(true);
    lastDocRef.current = null;

    // Cabut listener lama jika ada
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participantIds", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc"),
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Chat[];

        setChats(results);

        // Simpan doc terakhir sebagai cursor
        if (snapshot.docs.length > 0) {
          lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
        }

        // Jika hasil kurang dari PAGE_SIZE, tidak ada halaman berikutnya
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      },
      (error) => {
        console.error("Error fetching chats:", error);
      }
    );

    unsubscribeRef.current = unsubscribe;
    return () => unsubscribe();
  }, [user]);

  // Fungsi load halaman berikutnya (append, bukan replace)
  // Halaman lanjutan TIDAK realtime — ini trade-off yang disengaja
  // karena update realtime untuk 100+ chat tidak perlu
  const loadMore = useCallback(async () => {
    if (!user || !lastDocRef.current || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participantIds", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc"),
      startAfter(lastDocRef.current),
      limit(PAGE_SIZE)
    );

    // Gunakan getDocs (satu kali fetch) untuk halaman lanjutan
    const { getDocs } = await import("firebase/firestore");
    
    try {
      const snapshot = await getDocs(q);
      const newChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chat[];

      setChats((prev) => [...prev, ...newChats]);

      if (snapshot.docs.length > 0) {
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
      }

      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error loading more chats:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [user, isLoadingMore, hasMore]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const isLoading =
    status === "loading" || (status === "authenticated" && isFirebaseLoading);

  return { isLoading, isLoadingMore, chats, user, loadMore, hasMore };
};
