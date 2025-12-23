"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { toast } from "sonner";
import { createGuestSession } from "@/helper/create-guest-session";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

export default function CreateShopConversation({
  ownerAvatar,
  ownerId,
  ownerName,
  userId: initialUserId,
  displayName,
}: {
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  userId: string | undefined;
  displayName: string | undefined;
}) {
  const activeUserId = useRef(initialUserId);

  const router = useRouter();

  const [guestName, setGuestName] = useState(displayName ?? "");
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  // Cek Status Login
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log(currentUser);
      if (!currentUser) setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function onClick() {
    if (!activeUserId.current) {
      setShowDialog(true);
    } else {
      await startChat();
    }
  }

  async function startChat() {
    if (!activeUserId.current) {
      return;
    }

    if (!guestName) {
      return;
    }

    const chatId = `${activeUserId.current}_${ownerId}`;

    // create chat if not exists
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        id: chatId,

        participantIds: [activeUserId.current, ownerId],

        participantsInfo: {
          [ownerId]: {
            name: ownerName,
            avatar: ownerAvatar,
            role: "SHOP_OWNER",
          },
          [activeUserId.current]: {
            name: guestName,
            avatar: "avatars/default-avatar.jpg",
            role: "CUSTOMER",
          },
        },

        lastMessage: "Memulai percakapan",
        lastMessageAt: serverTimestamp(),
        lastMessageType: "TEXT",
        lastMessageSenderId: activeUserId.current,
      });
    }

    setIsLoading(false);

    router.push("/chat/" + chatId);
  }

  async function saveGuestDetails() {
    setIsLoading(true);

    if (!activeUserId.current) {
      const { userId: createdUserId } = await createGuestSession({
        name: guestName,
      });

      if (!createdUserId) {
        toast.error("Gagal membuat sesi tamu, silakan coba lagi");
        setIsLoading(false);
        setShowDialog(false);
        return;
      }

      // Simpan ke Ref agar klik berikutnya menggunakan ID ini
      activeUserId.current = createdUserId;
    }

    await startChat();
  }

  return (
    <div>
      <Button onClick={onClick} variant={"ghost"}>
        <MessageCircle />
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <form>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-start">
                Sesi Tidak Terdeteksi
              </DialogTitle>
              <DialogDescription className="text-start">
                Sepertinya anda baru kali ini menggunakan{" "}
                <span className="text-primary font-medium">Canteeners</span>{" "}
                masukkan nama untuk dapat memulai percakapan
              </DialogDescription>
            </DialogHeader>

            <Field>
              <Input
                autoComplete="off"
                value={guestName ?? ""}
                onChange={(event) => setGuestName(event.target.value)}
                aria-invalid={!guestName}
              />
              {!guestName && <FieldError>Tolong isi nama.</FieldError>}
            </Field>

            <DialogFooter>
              <Link
                href={"/syarat-dan-ketentuan"}
                className="text-sm underline text-blue-500 mt-2 text-center"
              >
                Pelajari Selengkapnya
              </Link>
              <div className="grid grid-cols-2 gap-4">
                <DialogClose asChild>
                  <Button variant="outline">Batal</Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={!guestName || isLoading}
                  onClick={saveGuestDetails}
                >
                  Simpan
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  );
}
