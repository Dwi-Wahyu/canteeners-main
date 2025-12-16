import { useEffect, useRef, useState, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  doc,
  writeBatch,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client"; // Sesuaikan path import
import { format } from "date-fns"; // install date-fns untuk format jam
import { Message, MediaItem } from "../lib/chat-types";
import { MediaGallery } from "./media-gallery";
import { PlayCircle, Check, CheckCheck } from "lucide-react";
import CustomerOrderChatBubble from "./customer-order-chat-bubble";
import ShopOrderChatBubble from "./shop-order-chat-bubble";

export function MessageList({
  chatId,
  currentUserId,
  isOwner,
}: {
  chatId: string;
  currentUserId: string;
  isOwner: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [initialMediaIndex, setInitialMediaIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch Pesan Realtime
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

  // Listen for Typing Status
  useEffect(() => {
    const chatRef = doc(db, "chats", chatId);
    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const typingData = data.typing || {};
        // Check if anyone else is typing
        const othersTyping = Object.entries(typingData).some(
          ([userId, typing]) => userId !== currentUserId && typing === true
        );
        setIsTyping(othersTyping);
      }
    });
    return () => unsubscribe();
  }, [chatId, currentUserId]);

  // Auto Scroll ke Bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]); // Scroll when typing status changes too

  // Mark Messages as Read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      const unreadMessages = messages.filter(
        (msg) => !msg.readBy.includes(currentUserId)
      );

      if (unreadMessages.length === 0) return;

      const batch = writeBatch(db);

      // 1. Update each message's readBy
      unreadMessages.forEach((msg) => {
        const msgRef = doc(db, "chats", chatId, "messages", msg.id);
        batch.update(msgRef, {
          readBy: arrayUnion(currentUserId),
        });
      });

      // 2. Reset unread count on parent chat document
      const chatRef = doc(db, "chats", chatId);
      const unreadField = isOwner ? "unreadCountSeller" : "unreadCountBuyer";

      batch.update(chatRef, {
        [unreadField]: 0,
      });

      try {
        await batch.commit();
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages, chatId, currentUserId, isOwner]);

  // Flatten all attachments from all messages into a single array for the gallery
  // We also need to map them back to find the index when a user clicks a specific image
  const allMediaItems = useMemo(() => {
    const items: MediaItem[] = [];
    messages.forEach((msg) => {
      if (msg.attachments && msg.attachments.length > 0) {
        items.push(...msg.attachments);
      } else if (msg.media && msg.media.length > 0) {
        // Backward compatibility
        items.push(...msg.media);
      }
    });
    return items;
  }, [messages]);

  const handleMediaClick = (clickedUrl: string) => {
    const index = allMediaItems.findIndex((item) => item.url === clickedUrl);
    if (index !== -1) {
      setInitialMediaIndex(index);
      setGalleryOpen(true);
    }
  };

  return (
    <div className="container p-5 pt-20 mb-96 max-w-7xl mx-auto flex flex-col gap-4">
      {messages.map((msg) => {
        const isSender = msg.senderId === currentUserId;
        const msgAttachments = msg.attachments || msg.media || [];

        if (msg.type === "order" && msg.order_id) {
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
            className={`flex flex-col ${
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
              {/* Render Attachments */}
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
                            {/* Thumbnail generator or just a placeholder if we don't have one?
                                        Since we don't have a thumbnail service, we can try to use a <video> tag
                                        with #t=0.1 to show the first frame, but controls disabled.
                                     */}
                            <video
                              src={`${item.url}#t=0.5`}
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <PlayCircle className="w-10 h-10 text-white opacity-80" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt="attachment"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Render Text */}
              {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
            </div>

            {/* Timestamp & Status */}
            <div
              className={`flex items-center gap-1 mt-1 px-1 text-[10px] text-gray-400 ${
                isSender ? "justify-end" : "justify-start"
              }`}
            >
              <span>
                {msg.createdAt
                  ? format(msg.createdAt.toDate(), "HH:mm")
                  : "Mengirim..."}
              </span>
              {isSender && (
                <span>
                  {msg.readBy.length > 1 ? (
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

      {/* Typing Indicator */}
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

      {/* Element dummy untuk scroll target */}
      <div ref={scrollRef} />

      <MediaGallery
        isOpen={galleryOpen}
        onOpenChange={setGalleryOpen}
        initialIndex={initialMediaIndex}
        mediaItems={allMediaItems}
      />
    </div>
  );
}
