"use client";

import { ChatInput } from "@/features/chat/ui/chat-input";
import { MessageList } from "@/features/chat/ui/message-list";
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
  const [isChatLoading, setIsChatLoading] = useState(true);

  useEffect(() => {
    async function getChat() {
      if (!session?.user?.id) return;
      try {
        setIsChatLoading(true);
        const backendUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
        const res = await fetch(`${backendUrl}/chats/${chatId}`, {
          headers: session?.user?.accessToken
            ? { Authorization: `Bearer ${session.user.accessToken}` }
            : {},
        });

        if (res.ok) {
          const data = await res.json();
          setChatData(data);
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
      } finally {
        setIsChatLoading(false);
      }
    }

    if (status === "authenticated") {
      getChat();
    } else if (status === "unauthenticated") {
      setIsChatLoading(false);
    }
  }, [status, session?.user?.id, session?.user?.accessToken, chatId]);

  if (status === "loading" || (status === "authenticated" && isChatLoading)) {
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

  if (!chatData || !session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Percakapan tidak ditemukan
          </h1>
        </div>
      </div>
    );
  }

  const currentUserId = session.user.id;
  const isOwner = role === "SHOP_OWNER";
  const opponentId = getOpponentId(chatData, currentUserId);
  const opponent = getOpponentInfo(chatData, currentUserId);

  if (!opponentId || !opponent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Pesan tidak valid
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-6 pb-32 min-h-screen">
      <ChatTopbar
        opponent={opponent}
        lastSeenAt={chatData.last_message_at || chatData.lastMessageAt}
        opponentId={opponentId}
        chatId={chatId}
      />

      <MessageList
        chatId={chatId}
        currentUserId={currentUserId}
        isOwner={isOwner}
      />

      <ChatInput
        chatId={chatId}
        currentUserId={currentUserId}
        opponentId={opponentId}
      />
    </div>
  );
}
