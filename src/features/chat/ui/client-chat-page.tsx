"use client";

import { ChatInput } from "@/features/chat/ui/chat-input";
import { MessageList } from "@/features/chat/ui/message-list";
import { db, auth } from "@/lib/firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import ChatTopbar from "./chat-topbar";
import LoadingDetailChatPage from "./loading-detail-chat-page";
import { Chat } from "../types";
import { getOpponentId, getOpponentInfo } from "../lib/chat-helper";
import { useSession } from "next-auth/react";

export default function ClientChatPage({
  chatId,
  role,
}: {
  chatId: string;
  role: "SHOP_OWNER" | "CUSTOMER";
}) {
  const { data: session, status } = useSession();
  const [chatData, setChatData] = useState<Chat | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(true);

  // Cek Status Login Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Jika session NextAuth sudah ada tapi token firebase tidak ada (sinkronisasi tidak akan jalan)
      if (status === "authenticated" && !session?.user?.firebaseToken) {
        setIsChatLoading(false);
      }
    });
    return () => unsubscribe();
  }, [status, session?.user?.firebaseToken]);

  useEffect(() => {
    async function getChat() {
      try {
        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
          setChatData(chatSnap.data() as Chat);

          updateDoc(chatRef, {
            [`lastSeenAt.${user?.uid}`]: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
      } finally {
        setIsChatLoading(false);
      }
    }

    if (user) {
      getChat();
    }
  }, [user, chatId]);

  if (
    status === "loading" ||
    (status === "authenticated" && !user && session?.user?.firebaseToken)
  ) {
    return <LoadingDetailChatPage />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Sesi tidak ditemukan
          </h1>
          <p className="text-muted-foreground mt-2">
            Silakan login kembali untuk melanjutkan.
          </p>
        </div>
      </div>
    );
  }

  if (isChatLoading) {
    return <LoadingDetailChatPage />;
  }

  if (!chatData) {
    return (
      <div>
        <h1>Percakapan tidak ditemukan</h1>
      </div>
    );
  }

  const isOwner = role === "SHOP_OWNER";

  if (!user) {
    return (
      <div>
        <h1>User tidak ditemukan</h1>
      </div>
    );
  }

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
