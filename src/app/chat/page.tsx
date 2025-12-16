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
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns"; // Opsional: untuk format tanggal
import { id as idLocale } from "date-fns/locale"; // Opsional: bahasa indonesia

// Definisi Tipe Data Chat untuk List
type ChatListItem = {
  id: string;
  sellerId: string;
  buyerId: string;
  lastMessage: string;
  shopName: string;
  lastMessageTimestamp: Timestamp;
  unreadCountBuyer: number;
  unreadCountSeller: number; // Biasanya di kode Anda unreadCountOwner
};

export default function GuestChatListPage() {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cek Status Login (Anonymous)
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Ambil Data Chat Realtime
  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, "chats");

    // Cari chat dimana participantIds mengandung UID user saat ini
    // Dan urutkan berdasarkan waktu pesan terakhir
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
        // Jika muncul error "index required", cek console browser
        // dan klik link yang diberikan Firebase untuk membuat index.
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading)
    return <div className="p-4 text-center">Memuat percakapan...</div>;

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p>Anda belum memulai percakapan apapun.</p>
        {/* Bisa tambahkan tombol redirect ke home */}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">Pesan Masuk</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>Belum ada percakapan.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 bg-white">
            {chats.map((chat) => {
              // Tentukan unread count untuk user ini (buyer)
              const unreadCount = chat.unreadCountBuyer || 0;

              // Format waktu (Fallback jika timestamp null saat pembuatan awal)
              const timeDisplay = chat.lastMessageTimestamp
                ? format(chat.lastMessageTimestamp.toDate(), "dd MMM HH:mm", {
                    locale: idLocale,
                  })
                : "Baru saja";

              return (
                <div
                  key={chat.id}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Avatar Placeholder */}
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                    K
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {chat.shopName}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {timeDisplay}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <p
                        className={`text-sm truncate ${
                          unreadCount > 0
                            ? "font-semibold text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {chat.lastMessage || "Mulai percakapan..."}
                      </p>

                      {/* Badge Unread */}
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
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
