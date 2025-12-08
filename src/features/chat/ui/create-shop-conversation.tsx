"use client";

import { Button } from "@/components/ui/button";
import { useInitializeGuestProfile } from "@/hooks/use-guest-profile";
import { useState } from "react";
import { GuestDetailsFormDialog } from "./guest-details-form-dialog";
import { getAuth, signInAnonymously } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { createGuestCustomer } from "@/features/user/lib/user-actions";
import { toast } from "sonner";

export default function CreateShopConversation({
  ownerUserId,
  shopName,
}: {
  ownerUserId: string;
  shopName: string;
}) {
  const initGuestProfile = useInitializeGuestProfile();
  const router = useRouter();

  const [guestName, setGuestName] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const auth = getAuth();

  function onClick() {
    console.log(auth.currentUser);

    if (!auth.currentUser) {
      setShowDialog(true);
    } else {
      startChat();
    }
  }

  async function startChat() {
    let user = auth.currentUser;

    if (!user) {
      const result = await signInAnonymously(auth);
      user = result.user;

      const guestUser = await createGuestCustomer({
        firebaseUserUid: user.uid,
        guestName,
      });

      if (guestUser.success && guestUser.data) {
        await initGuestProfile({
          cartId: guestUser.data.cart_id,
          customerId: guestUser.data.customer_id,
          userId: guestUser.data.user_id, // firebase uid
        });
        toast.success("Berhasil membuat guest user");
      } else {
        toast.error("Terjadi kesalahan");
      }
    }

    const chatId = `${user.uid}_${ownerUserId}`;

    // create chat if not exists
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        id: chatId,
        buyerId: user.uid,
        sellerId: ownerUserId,

        participantIds: [user.uid, ownerUserId],

        shopName,

        lastMessageTimestamp: serverTimestamp(),
        lastMessage: "",

        unreadCountBuyer: 0,
        unreadCountSeller: 0,
      });
    }

    router.push("/chat/" + chatId);
  }

  async function onSaveGuestDetails() {
    setShowDialog(false);
    await startChat();
  }

  return (
    <>
      <Button onClick={onClick}>Hubungi Kedai</Button>

      <GuestDetailsFormDialog
        guestName={guestName}
        setGuestName={setGuestName}
        showGuestDetailsFormDialog={showDialog}
        setShowGuestDetailsFormDialog={setShowDialog}
        onSaveGuestDetails={onSaveGuestDetails}
      />
    </>
  );
}
