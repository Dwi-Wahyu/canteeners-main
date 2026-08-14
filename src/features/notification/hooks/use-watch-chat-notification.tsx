"use client";

import { useSocket } from "@/lib/realtime/socket-context";
import { useEffect } from "react";
import { toast } from "sonner";
import { ChatNotificationToast } from "../ui/chat-notification-toast";
import { Chat } from "@/features/chat/types";

export const useWatchChatNotification = (uid: string | null) => {
  const socket = useSocket();

  useEffect(() => {
    if (!uid || !socket) return;

    const unsubscribe = socket.on("chat:new-message", (data: any) => {
      const { message, chatId, senderName, senderAvatar } = data;
      const senderId = message?.sender_id || message?.senderId;

      if (message && senderId !== uid && message.type !== "ORDER") {
        const fakeOpponentId = senderId || "opponent";
        const notificationObj: Chat = {
          id: chatId || message.chat_id,
          lastMessage:
            message.text ||
            (message.type === "ATTACHMENT" ? "Mengirim lampiran" : "Pesan baru"),
          participantsInfo: {
            [fakeOpponentId]: {
              name: senderName || "Pengirim",
              avatar: senderAvatar || "avatars/default-avatar.jpg",
              role: "CUSTOMER",
            },
          },
        };

        toast.custom((id) => (
          <ChatNotificationToast
            notification={notificationObj}
            currentUid={uid}
            onDismiss={() => toast.dismiss(id)}
          />
        ));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [uid, socket]);

  return null;
};
