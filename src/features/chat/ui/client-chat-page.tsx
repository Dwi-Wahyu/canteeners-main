"use client";

import { ChatInput } from "@/features/chat/ui/chat-input";
import { MessageList } from "@/features/chat/ui/message-list";
import { db } from "@/lib/firebase/client";
import { getAuth } from "firebase/auth";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import ChatTopbar from "./chat-topbar";
import LoadingDetailChatPage from "./loading-detail-chat-page";
import { Chat } from "../types";
import { getOpponentId, getOpponentInfo } from "../lib/chat-helper";

export default function ClientChatPage({
  chatId,
  role,
}: {
  chatId: string;
  role: "SHOP_OWNER" | "CUSTOMER";
}) {
  const { currentUser } = getAuth();
  const [chatData, setChatData] = useState<Chat | null>(null);

  useEffect(() => {
    async function getChat() {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        setChatData(chatSnap.data() as Chat);

        updateDoc(chatRef, {
          [`lastSeenAt.${currentUser?.uid}`]: serverTimestamp(),
        });
      }
    }

    if (currentUser) {
      getChat();
    }
  }, [currentUser]);

  if (!currentUser || !chatData) {
    return <LoadingDetailChatPage />;
  }

  const isOwner = role === "SHOP_OWNER";

  const opponentId = getOpponentId(chatData, currentUser.uid);
  const opponent = getOpponentInfo(chatData, currentUser.uid);

  if (!opponentId) {
    return (
      <div>
        <h1>Pesan tidak valid</h1>
      </div>
    );
  }

  if (!opponent) {
    return (
      <div>
        <h1>Pesan tidak valid</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-6 pb-32 min-h-screen">
      <ChatTopbar
        opponent={opponent}
        lastSeenAt={chatData.lastSeenAt?.[currentUser.uid]}
      />

      <MessageList
        chatId={chatId}
        currentUserId={currentUser.uid}
        isOwner={isOwner}
      />

      <ChatInput
        chatId={chatId}
        currentUserId={currentUser.uid}
        opponentId={opponentId}
      />
    </div>
  );
}
