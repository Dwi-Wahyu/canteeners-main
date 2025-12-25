"use client";

import { ChatInput } from "@/features/chat/ui/chat-input";
import { MessageList } from "@/features/chat/ui/message-list";
import { db } from "@/lib/firebase/client";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
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
  const [chatData, setChatData] = useState<Chat | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cek Status Login
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function getChat() {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        setChatData(chatSnap.data() as Chat);

        updateDoc(chatRef, {
          [`lastSeenAt.${user?.uid}`]: serverTimestamp(),
        });
      }

      setIsLoading(false);
    }

    if (user) {
      getChat();
    }
  }, [user]);

  if (isLoading) {
    return <LoadingDetailChatPage />;
  }

  if (!user) {
    return (
      <div>
        <h1>Sesi tidak ditemukan</h1>
      </div>
    );
  }

  if (!chatData) {
    return (
      <div>
        <h1>Percakapan tidak ditemukan</h1>
      </div>
    );
  }

  const isOwner = role === "SHOP_OWNER";

  const opponentId = getOpponentId(chatData, user.uid);
  const opponent = getOpponentInfo(chatData, user.uid);

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
        lastSeenAt={chatData.lastSeenAt?.[user.uid]}
        opponentId={opponentId}
        chatId={chatId}
      />

      <MessageList chatId={chatId} currentUserId={user.uid} isOwner={isOwner} />

      <ChatInput
        chatId={chatId}
        currentUserId={user.uid}
        opponentId={opponentId}
      />
    </div>
  );
}
