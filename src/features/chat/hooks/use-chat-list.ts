import { auth, db } from "@/lib/firebase/client";
import { Chat } from "../types";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export const useChatList = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  // Cek Status Login Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsFirebaseLoading(false);

      // Jika session NextAuth sudah ada tapi token firebase tidak ada
      if (status === "authenticated" && !session?.user?.firebaseToken) {
        setIsFirebaseLoading(false);
      }
    });
    return () => unsubscribe();
  }, [status, session?.user?.firebaseToken]);

  // Ambil Data Chat Realtime
  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, "chats");

    const q = query(
      chatsRef,
      where("participantIds", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Chat[];

        setChats(results);
      },
      (error) => {
        console.error("Error fetching chats:", error);
      },
    );

    return () => unsubscribe();
  }, [user]);

  // Gabungkan status loading NextAuth dan Firebase
  const isLoading =
    status === "loading" || (status === "authenticated" && isFirebaseLoading);

  return { isLoading, chats, user };
};
