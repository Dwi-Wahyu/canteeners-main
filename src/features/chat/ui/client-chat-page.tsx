"use client";

import { ChatInput } from "@/features/chat/ui/chat-input";
import { MessageList } from "@/features/chat/ui/message-list";
import { db } from "@/lib/firebase/client";
import { getAuth } from "firebase/auth";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import ChatTopbar from "./chat-topbar";
import LoadingDetailChatPage from "./loading-detail-chat-page";

type ChatData = {
  id: string;

  participantIds: string[];

  buyerId: string;
  buyerName: string;
  buyerAvatar: string;

  sellerId: string;
  shopName: string;

  lastMessage: string;
  lastMessageTimestamp: Timestamp;

  unreadCountBuyer: number;
  unreadCountSeller: number;

  createdAt?: Date;
};

export default function ClientChatPage({ chatId }: { chatId: string }) {
  const { currentUser } = getAuth();
  const [chatData, setChatData] = useState<ChatData | null>(null);

  useEffect(() => {
    async function getChat() {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        console.log(chatSnap.data());

        setChatData(chatSnap.data() as ChatData);
      }
    }

    if (currentUser) {
      getChat();
    }
  }, [currentUser]);

  if (!currentUser || !chatData) return <LoadingDetailChatPage />;

  const isOwner = currentUser.uid === chatData.sellerId;

  return (
    <div className="flex flex-col h-screen max-h-svh">
      <ChatTopbar
        isOwner={isOwner}
        avatar={isOwner ? chatData.buyerAvatar : "avatar/default-avatar.jpg"}
        name={isOwner ? chatData.buyerName : chatData.shopName}
      />

      <MessageList
        chatId={chatId}
        currentUserId={currentUser.uid}
        isOwner={isOwner}
      />

      <ChatInput
        chatId={chatId}
        currentUserId={currentUser.uid}
        isOwner={isOwner}
      />
    </div>
  );
}
