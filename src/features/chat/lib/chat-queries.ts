import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/client";

export async function getOrCreateChat({
  buyerId,
  sellerId,
}: {
  buyerId: string;
  sellerId: string;
}) {
  const chatId = `${buyerId}_${sellerId}`;
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participantIds: [buyerId, sellerId],
      buyerId,
      sellerId,
      lastMessage: "",
      lastMessageTimestamp: null,
      unreadCountBuyer: 0,
      unreadCountSeller: 0,
      createdAt: serverTimestamp(),
    });
  }

  return chatId;
}
