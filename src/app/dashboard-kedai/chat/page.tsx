"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/helper/get-image-url";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useWatchChatNotification } from "@/features/notification/hooks/use-watch-chat-notification";
import { useChatList } from "@/features/chat/hooks/use-chat-list";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMyUnreadCount,
  getOpponentInfo,
  isOpponentTyping,
} from "@/features/chat/lib/chat-helper";

export default function OwnerChatListPage() {
  const { chats, isLoading, user } = useChatList();

  useWatchChatNotification(user ? user.uid : null);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-xl mb-4">Chat & Orderan</h1>

        <div className="relative bg-card mb-6">
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
            <Search className="size-4" />
            <span className="sr-only">User</span>
          </div>
          <Input
            type="text"
            placeholder="Cari Pelanggan atau Nomor Meja"
            className="peer pl-9 bg-card"
          />
        </div>

        <div className="space-y-4">
          <Skeleton className="w-full h-32" />
          <Skeleton className="w-full h-32" />
          <Skeleton className="w-full h-32" />
          <Skeleton className="w-full h-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <h1 className="text-xl mb-4">Chat & Orderan</h1>

        <div className="relative bg-card mb-6">
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
            <Search className="size-4" />
            <span className="sr-only">User</span>
          </div>
          <Input
            type="text"
            placeholder="Cari Pelanggan atau Nomor Meja"
            className="peer pl-9 bg-card"
          />
        </div>

        <div className="text-center text-muted-foreground py-4">
          <h1>Belum Ada Percakapan oleh pelanggan</h1>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-medium tracking-tight mb-4">
        Chat & Orderan
      </h2>

      <div className="relative bg-card mb-6">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <Search className="size-4" />
          <span className="sr-only">User</span>
        </div>
        <Input
          type="text"
          placeholder="Cari Pelanggan atau Nomor Meja"
          className="peer pl-9 bg-card"
        />
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {chats.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Belum ada percakapan dari pelanggan.
          </div>
        ) : (
          <div className="divide-y">
            {chats.map((chat) => {
              const unreadCount = getMyUnreadCount(chat, user.uid);

              const isTyping = isOpponentTyping(chat, user.uid);

              const opponentInfo = getOpponentInfo(chat, user.uid);

              const timeDisplay = chat.lastMessageAt
                ? format(chat.lastMessageAt.toDate(), "dd MMM HH:mm", {
                    locale: idLocale,
                  })
                : "";

              if (!opponentInfo) {
                return (
                  <div>
                    <h1>Pesan tidak valid</h1>
                  </div>
                );
              }

              return (
                <Link
                  key={chat.id}
                  href={`/dashboard-kedai/chat/${chat.id}`}
                  className={`p-4 hover:bg-gray-50 cursor-pointer flex gap-4 items-center ${
                    unreadCount > 0 ? "bg-blue-50/50" : ""
                  }`}
                >
                  <Avatar className="size-11 shadow">
                    <AvatarImage src={getImageUrl(opponentInfo.avatar)} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">
                        {opponentInfo.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {timeDisplay}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <p
                        className={`text-sm truncate ${
                          isTyping
                            ? "text-green-600 font-medium italic animate-pulse"
                            : unreadCount > 0
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {isTyping
                          ? "Sedang mengetik..."
                          : chat.lastMessage || "Lampiran gambar"}
                      </p>

                      {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
