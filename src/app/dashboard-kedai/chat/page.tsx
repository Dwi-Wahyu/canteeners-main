"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import OwnerLayout from "@/components/layouts/owner-layout";

type ChatListItem = {
  id: string;
  sellerId: string;
  buyerId: string;
  lastMessage: string;
  lastMessageTimestamp: Timestamp;
  unreadCountBuyer: number;
  unreadCountSeller: number;
  typing?: Record<string, boolean>;
};

export default function OwnerChatListPage() {
  const [user, setUser] = useState<any | null>(null);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    // Wait for auth to be ready. In dashboard-kedai, we expect user to be logged in via sync
    // But it might take a moment for the firebase client sdk to sync.
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participantIds", "array-contains", user.uid),
      orderBy("lastMessageTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatListItem[];

        setChats(results);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching chats:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="p-10 text-center">Memuat pesan...</div>;

  if (!user)
    return <div className="p-10 text-center">Silakan login kembali.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pesan Masuk</h1>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {chats.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Belum ada percakapan dari pelanggan.
          </div>
        ) : (
          <div className="divide-y">
            {chats.map((chat) => {
              const unreadCount = chat.unreadCountSeller || 0;

              // Check Typing Status
              const typingData = chat.typing || {};
              // Buyer is the one NOT the seller. Since this is OwnerChatListPage, user is seller.
              // We want to know if 'buyerId' is typing.
              const isTyping = typingData[chat.buyerId] === true;

              const timeDisplay = chat.lastMessageTimestamp
                ? format(chat.lastMessageTimestamp.toDate(), "dd MMM HH:mm", {
                  locale: idLocale,
                })
                : "";

              return (
                <div
                  key={chat.id}
                  onClick={() => router.push(`/dashboard-kedai/chat/${chat.id}`)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer flex gap-4 items-center ${unreadCount > 0 ? "bg-blue-50/50" : ""
                    }`}
                >
                  {/* Buyer Avatar Placeholder */}
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                    P
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">
                        Pelanggan {chat.buyerId.slice(0, 5)}...
                      </h3>
                      <span className="text-xs text-gray-500">
                        {timeDisplay}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-sm truncate ${isTyping ? "text-green-600 font-medium italic animate-pulse" : (unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500")}`}>
                        {isTyping ? "Sedang mengetik..." : (chat.lastMessage || "Lampiran gambar")}
                      </p>

                      {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
