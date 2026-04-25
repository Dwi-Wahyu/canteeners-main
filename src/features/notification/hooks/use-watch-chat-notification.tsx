import { db } from "@/lib/firebase/client";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Chat } from "@/features/chat/types";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { usePathname } from "next/navigation";
import { useToastStore } from "@/stores/use-toast-store";

export const useWatchChatNotification = () => {
  const [user, setUser] = useState<User | null>(null);
  const previousTimestamps = useRef<Map<string, number>>(new Map());
  const isFirstRun = useRef(true);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const addToast = useToastStore((state) => state.addToast);

  // Update pathname ref
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Cek Status Login
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const chatsRef = collection(db, "chats");

    const q = query(
      chatsRef,
      where("participantIds", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstRun.current) {
        // Populate initial timestamps so we don't trigger sound for existing messages
        snapshot.docs.forEach((doc) => {
          const data = doc.data() as Chat;
          previousTimestamps.current.set(
            doc.id,
            data.lastMessageAt?.toMillis() || 0
          );
        });
        isFirstRun.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          // Ignore local pending writes (e.g. when WE update lastSeenAt) to avoid double trigger
          if (change.doc.metadata.hasPendingWrites) return;

          const data = change.doc.data() as Chat;
          const chatId = change.doc.id;

          // Tidak perlu tampilkan notifikasi order
          if (data.lastMessageType === "ORDER") {
            return;
          }

          const currentTime = data.lastMessageAt?.toMillis() || 0;
          const prevTime = previousTimestamps.current.get(chatId) ?? 0;

          if (data.lastMessageSenderId !== user.uid && currentTime > prevTime) {
            const isChatPage = pathnameRef.current.includes(`/chat/${chatId}`);

            if (!isChatPage) {
              const audio = new Audio("/sounds/chat-notification.mp3");
              audio.volume = 0.5;
              audio.play().catch((err) =>
                console.warn("Chat notification sound blocked:", err)
              );

              // Gunakan custom toast store
              addToast(data, user.uid);
            }
          }

          // Update timestamp
          previousTimestamps.current.set(chatId, currentTime);
        }
      });
    });

    return () => {
      unsubscribe();
      previousTimestamps.current.clear();
      isFirstRun.current = true;
    };
  }, [user, addToast]);

  return null;
};
