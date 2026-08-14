"use client";

import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const activeUserId = useRef(initialUserId);
  const router = useRouter();

  const [guestName, setGuestName] = useState(displayName ?? "");
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onClick() {
    if (!activeUserId.current) {
      setShowDialog(true);
    } else {
      await startChat();
    }
  }

  async function startChat() {
    if (!activeUserId.current) return;

    try {
      setIsLoading(true);
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
      const res = await fetch(`${backendUrl}/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session?.user?.accessToken
            ? `Bearer ${session.user.accessToken}`
            : "",
        },
        body: JSON.stringify({
          owner_id: ownerId,
          customer_id: activeUserId.current,
        }),
      });

      if (res.ok) {
        const chat = await res.json();
        router.push("/chat/" + chat.id);
      } else {
        toast.error("Gagal membuat percakapan");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Terjadi kesalahan saat memulai percakapan");
    } finally {
      setIsLoading(false);
    }
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
        <form onSubmit={(e) => e.preventDefault()}>
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
                  type="button"
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
