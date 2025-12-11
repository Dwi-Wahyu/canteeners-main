import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";

export function ChatInput({
  chatId,
  currentUserId,
  isOwner,
}: {
  chatId: string;
  currentUserId: string;
  isOwner: boolean;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      // Tambahkan ke Subcollection Messages
      const messageData = {
        senderId: currentUserId,
        text: text,
        type: "text",
        media: [], // Kosongkan dulu jika hanya text
        readBy: [currentUserId],
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "chats", chatId, "messages"), messageData);

      // Update Parent Chat Document (Metadata)
      // Ini penting agar list chat di halaman depan terupdate
      const chatRef = doc(db, "chats", chatId);

      // Jika yang kirim Buyer (Pelanggan), increment unreadCountSeller (Kedai)
      // Jika yang kirim Seller (Kedai), increment unreadCountBuyer (Pelanggan)
      const unreadUpdate = isOwner
        ? { unreadCountBuyer: increment(1) }
        : { unreadCountSeller: increment(1) };

      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageTimestamp: serverTimestamp(),
        ...unreadUpdate,
      });

      setText("");
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSend}
      className="p-4 bg-white border-t flex gap-2 items-center"
    >
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tulis pesan..."
        className="flex-1"
        disabled={loading}
      />

      <Button type="submit" size="icon" disabled={loading || !text.trim()}>
        <SendIcon className="h-4 w-4" />
      </Button>
    </form>
  );
}
