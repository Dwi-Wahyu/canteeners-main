import { db } from "@/lib/firebase/client";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ChatNotificationToast } from "../ui/chat-notification-toast";
import { Chat } from "@/features/chat/types";

export const useWatchChatNotification = (uid: string | null) => {
  const previousTimestamps = useRef<Map<string, number>>(new Map());
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!uid) {
      return;
    }

    const chatsRef = collection(db, "chats");

    // nanti batasi 20 dokumen terakhir untuk hemat free tier
    const q = query(
      chatsRef,
      where("participantIds", "array-contains", uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          if (change.doc.metadata.hasPendingWrites) return;

          const data = change.doc.data() as Chat;
          const chatId = change.doc.id;

          const currentTime = data.lastMessageAt.toMillis();
          const prevTime = previousTimestamps.current.get(chatId) ?? 0;

          if (data.lastMessageSenderId !== uid && currentTime > prevTime) {
            toast.custom(() => (
              <ChatNotificationToast notification={data} currentUid={uid} />
            ));
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
  }, [uid]);

  return null;
};
