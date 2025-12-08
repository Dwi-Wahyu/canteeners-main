import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client"; // Sesuaikan path import
import { format } from "date-fns"; // Optional: install date-fns untuk format jam
import { Message } from "../lib/chat-types";

export function MessageList({
  chatId,
  currentUserId,
}: {
  chatId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Pesan Realtime
  useEffect(() => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  // 2. Auto Scroll ke Bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 h-[500px]">
      {messages.map((msg) => {
        const isMe = msg.senderId === currentUserId;

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 text-sm ${
                isMe
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm"
              }`}
            >
              {/* Render Media/Gambar jika ada */}
              {msg.media && msg.media.length > 0 && (
                <div className="mb-2 space-y-2">
                  {msg.media.map((item, idx) => (
                    <img
                      key={idx}
                      src={item.url}
                      alt="attachment"
                      className="rounded-md max-h-48 object-cover w-full"
                    />
                  ))}
                </div>
              )}

              {/* Render Text */}
              {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
            </div>

            {/* Timestamp */}
            <span className="text-[10px] text-gray-400 mt-1 px-1">
              {msg.createdAt
                ? format(msg.createdAt.toDate(), "HH:mm")
                : "Mengirim..."}
            </span>
          </div>
        );
      })}
      {/* Element dummy untuk scroll target */}
      <div ref={scrollRef} />
    </div>
  );
}
