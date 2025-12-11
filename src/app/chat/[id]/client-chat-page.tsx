"use client";

import { ChatInput } from "@/features/chat/ui/chat-input";
import { MessageList } from "@/features/chat/ui/message-list";
import { db } from "@/lib/firebase/client";
import { getAuth } from "firebase/auth";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type ChatData = {
  id: string;

  participantIds: string[];

  buyerId: string;
  sellerId: string;

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

  if (!currentUser || !chatData) return <div>Loading...</div>;

  const isOwner = currentUser.uid === chatData.sellerId;

  return (
    <div className="flex flex-col h-screen max-h-svh">
      <div className="p-4 flex items-center gap-1 border-b bg-white shadow-sm z-10">
        <Link className="text-muted-foreground" href={isOwner ? '/dashboard-kedia/chat' : '/chat'}>
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <h1 className="font-semibold text-lg">
          Chat dengan {isOwner ? "Pelanggan" : "Kedai"}
        </h1>
      </div>

      <MessageList chatId={chatId} currentUserId={currentUser.uid} />

      <ChatInput
        chatId={chatId}
        currentUserId={currentUser.uid}
        isOwner={isOwner}
      />
    </div>
  );
}
