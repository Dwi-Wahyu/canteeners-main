"use client";

import { ChatInput } from "@/features/chat/ui/chat-list";
import { MessageList } from "@/features/chat/ui/message-list";
import { db } from "@/lib/firebase/client";
import { getAuth } from "firebase/auth";
import { doc, getDoc, Timestamp } from "firebase/firestore";
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
    <div className="flex flex-col h-screen max-h-screen">
      <div className="p-4 border-b bg-white shadow-sm z-10">
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

    // <div>
    //   {!currentUser ? (
    //     <div>
    //       <h1>Anda tidak berhak mengakses, user id belum ada</h1>
    //     </div>
    //   ) : (
    //     <div>
    //       <h1>{chatId}</h1>

    //       {!chatData ? (
    //         <div>
    //           <h1>data chat tidak ditemukan</h1>
    //         </div>
    //       ) : (
    //         <div>
    //           {chatData.buyerId !== currentUser.uid ? (
    //             <div>
    //               <h1>Anda bukan peserta chat ini</h1>
    //             </div>
    //           ) : (
    //             <div>
    //               <h1>Terverifikasi</h1>
    //             </div>
    //           )}
    //         </div>
    //       )}
    //     </div>
    //   )}
    // </div>
  );
}
