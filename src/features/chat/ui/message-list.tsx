"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { getImageUrl } from "@/helper/get-image-url";
import { format } from "date-fns";
import { Message, Attachment } from "../types";
import { MediaGallery } from "./media-gallery";
import { PlayCircle, Check, CheckCheck } from "lucide-react";
import CustomerOrderChatBubble from "./customer-order-chat-bubble";
import ShopOrderChatBubble from "./shop-order-chat-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/lib/realtime/socket-context";
import { useSession } from "next-auth/react";

export function MessageList({
  chatId,
  currentUserId,
  isOwner,
}: {
  chatId: string;
  currentUserId: string;
  isOwner: boolean;
}) {
  const { data: session } = useSession();
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [initialMediaIndex, setInitialMediaIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch initial messages from REST API
  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
      const res = await fetch(`${backendUrl}/chats/${chatId}/messages`, {
        headers: session?.user?.accessToken
          ? { Authorization: `Bearer ${session.user.accessToken}` }
          : {},
      });
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
      }
    } catch (e) {
      console.error("Error fetching messages:", e);
    }
  }, [chatId, session?.user?.accessToken]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // WebSocket Subscription for Messages & Typing Status
  useEffect(() => {
    if (!chatId || !socket) return;

    const topic = `chat:${chatId}`;
    socket.join(topic);

    const unsubMessage = socket.on("chat:message", (data: any) => {
      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    });

    const unsubTyping = socket.on("chat:typing", (data: any) => {
      if (data.userId !== currentUserId) {
        setIsTyping(!!data.isTyping);
      }
    });

    const unsubRead = socket.on("chat:read", (data: any) => {
      if (data.userId !== currentUserId) {
        setMessages((prev) => 
          prev.map(msg => {
            const readBy = msg.read_by || msg.readBy || [];
            if (!readBy.includes(data.userId) && (msg.sender_id || msg.senderId) === currentUserId) {
              return { ...msg, read_by: [...readBy, data.userId], readBy: [...readBy, data.userId] };
            }
            return msg;
          })
        );
      }
    });

    return () => {
      socket.leave(topic);
      unsubMessage();
      unsubTyping();
      unsubRead();
    };
  }, [chatId, socket, currentUserId]);

  // Auto Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Mark Messages as Read via REST endpoint
  useEffect(() => {
    const markRead = async () => {
      if (!session?.user?.accessToken || !chatId) return;
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
        await fetch(`${backendUrl}/chats/${chatId}/read`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });
      } catch (e) {
        console.error("Error marking chat read:", e);
      }
    };

    if (messages.length > 0) {
      markRead();
    }
  }, [messages.length, chatId, session?.user?.accessToken]);

  const attachments = useMemo(() => {
    const items: Attachment[] = [];
    messages.forEach((msg) => {
      const msgAttachments = msg.attachments || [];
      if (Array.isArray(msgAttachments) && msgAttachments.length > 0) {
        items.push(...msgAttachments);
      }
    });
    return items;
  }, [messages]);

  const handleMediaClick = (clickedUrl: string) => {
    const index = attachments.findIndex((item) => item.url === clickedUrl);
    if (index !== -1) {
      setInitialMediaIndex(index);
      setGalleryOpen(true);
    }
  };

  const parseMessageDate = (raw: any): Date | null => {
    if (!raw) return null;
    if (typeof raw === "object" && typeof raw.toDate === "function") {
      return raw.toDate();
    }
    if (typeof raw === "object" && typeof raw.seconds === "number") {
      return new Date(raw.seconds * 1000);
    }
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  };

  return (
    <ScrollArea className="container p-5 pt-20 max-w-7xl mx-auto flex flex-col gap-4">
      {messages.map((msg) => {
        const senderId = msg.sender_id || msg.senderId;
        const isSender = senderId === currentUserId;
        const msgAttachments = (msg.attachments as Attachment[]) || [];
        const readBy = msg.read_by || msg.readBy || [];
        const createdDate = parseMessageDate(msg.created_at || msg.createdAt);

        if (msg.type === "ORDER" && msg.order_id) {
          if (isSender) {
            return (
              <CustomerOrderChatBubble order_id={msg.order_id} key={msg.id} />
            );
          } else {
            return <ShopOrderChatBubble order_id={msg.order_id} key={msg.id} />;
          }
        }

        return (
          <div
            key={msg.id}
            className={`flex flex-col mb-4 ${
              isSender ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`px-4 py-3 mt-1 rounded-xl shadow max-w-[80%] ${
                isSender
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {msgAttachments.length > 0 && (
                <div
                  className={`mb-2 gap-1 grid ${
                    msgAttachments.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {msgAttachments.map((item, idx) => {
                    const isVideo = item.contentType?.startsWith("video/");
                    return (
                      <div
                        key={idx}
                        className={`relative cursor-pointer overflow-hidden rounded-md w-full h-full ${
                          msgAttachments.length > 2
                            ? "aspect-square"
                            : "max-h-64"
                        }`}
                        onClick={() => handleMediaClick(item.url)}
                      >
                        {isVideo ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <video
                              src={`${getImageUrl("/message-media-video/" + item.url)}#t=0.5`}
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <PlayCircle className="w-10 h-10 text-white opacity-80" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={getImageUrl("/message-media-image/" + item.url)}
                            alt="attachment"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
            </div>

            <div
              className={`flex items-center gap-1 mt-1 px-1 text-[10px] text-gray-400 ${
                isSender ? "justify-end" : "justify-start"
              }`}
            >
              <span>
                {createdDate ? format(createdDate, "HH:mm") : "Mengirim..."}
              </span>
              {isSender && (
                <span>
                  {readBy.length > 1 ? (
                    <CheckCheck className="w-3 h-3 text-blue-500" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse">
          <span className="flex gap-1">
            <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
          </span>
          Sedang mengetik...
        </div>
      )}

      <div ref={scrollRef} />

      <MediaGallery
        isOpen={galleryOpen}
        onOpenChange={setGalleryOpen}
        initialIndex={initialMediaIndex}
        attachments={attachments}
      />
    </ScrollArea>
  );
}
