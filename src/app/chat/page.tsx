"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/helper/get-image-url";
import { useWatchChatNotification } from "@/features/notification/hooks/use-watch-chat-notification";
import { useChatList } from "@/features/chat/hooks/use-chat-list";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMyUnreadCount,
  getOpponentInfo,
  isOpponentTyping,
} from "@/features/chat/lib/chat-helper";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "nextjs-toploader/app";
import LandingTopbar from "@/components/layouts/landing-topbar";
import NavButton from "@/components/nav-button";

export default function CustomerChatListPage() {
  const { chats, isLoading, user } = useChatList();
  const router = useRouter();
  const { data: session } = useSession();

  // Watch global chat notification (toast saat ada pesan baru)
  useWatchChatNotification(user?.uid ?? null);

  useEffect(() => {
    if (session?.user?.role === "SHOP_OWNER") {
      router.push("/dashboard-kedai/chat");
    }
  }, [session, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-5 pt-20">
        <LandingTopbar />

        <h1 className="text-xl mb-4">Chat & Orderan</h1>

        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-full h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // User belum login atau data belum ready
  if (!user) {
    return (
      <div className="p-5 pt-20">
        <LandingTopbar />

        <h1 className="text-xl mb-4">Chat & Orderan</h1>

        <div className="text-center text-muted-foreground py-10">
          <p>Belum ada percakapan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 pt-20">
      <LandingTopbar />

      <h1 className="text-xl mb-4">Chat & Orderan</h1>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {chats.length === 0 ? (
          <div className="p-10 flex flex-col items-center gap-4 justify-center">
            <h1 className="text-center text-gray-500">Belum ada percakapan</h1>

            <NavButton href="/kantin/kantin-kudapan">Buat Order</NavButton>
          </div>
        ) : (
          <div className="divide-y">
            {chats.map((chat) => {
              const opponent = getOpponentInfo(chat, user.uid);
              const unreadCount = getMyUnreadCount(chat, user.uid);
              const typing = isOpponentTyping(chat, user.uid);

              const timeDisplay = chat.lastMessageAt
                ? format(chat.lastMessageAt.toDate(), "dd MMM HH:mm", {
                    locale: idLocale,
                  })
                : "";

              if (!opponent) return null; // safety

              return (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className={`p-4 hover:bg-gray-50 cursor-pointer flex gap-4 items-center transition-colors ${
                    unreadCount > 0 ? "bg-blue-50/50" : ""
                  }`}
                >
                  <Avatar className="size-11 shadow shrink-0">
                    <AvatarImage src={getImageUrl(opponent.avatar)} />
                    <AvatarFallback>
                      {opponent.name?.charAt(0).toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {opponent.name || "Pelanggan"}
                      </h3>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">
                        {timeDisplay}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <p
                        className={`text-sm truncate ${
                          typing
                            ? "text-green-600 font-medium italic animate-pulse"
                            : unreadCount > 0
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {typing
                          ? "Sedang mengetik..."
                          : chat.lastMessage || "Lampiran"}
                      </p>

                      {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full shrink-0 ml-2">
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
