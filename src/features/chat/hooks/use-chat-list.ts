import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Chat } from "../types";

export const useChatList = () => {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cek Status Login
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log(currentUser);

      if (!currentUser) setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Ambil Data Chat Realtime
  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, "chats");

    // Cari chat dimana participantIds mengandung UID user saat ini
    // Dan urutkan berdasarkan waktu pesan terakhir
    const q = query(
      chatsRef,
      where("participantIds", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Chat[];

        setChats(results);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching chats:", error);
        // Jika muncul error "index required", cek console browser
        // dan klik link yang diberikan Firebase untuk membuat index.
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { isLoading, chats, user };
};
