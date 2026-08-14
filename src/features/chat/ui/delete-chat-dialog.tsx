"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function DeleteChatDialog({ chatId }: { chatId: string }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsLoading(true);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
      const res = await fetch(`${backendUrl}/chats/${chatId}`, {
        method: "DELETE",
        headers: session?.user?.accessToken
          ? { Authorization: `Bearer ${session.user.accessToken}` }
          : {},
      });

      if (res.ok) {
        setIsOpen(false);
        router.push("/chat");
      } else {
        toast.error("Gagal menghapus percakapan");
      }
    } catch (e) {
      console.error("Error deleting chat:", e);
      toast.error("Terjadi kesalahan saat menghapus percakapan");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={"ghost"} className="w-fit">
          <Trash2 />
          Hapus Chat
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-start">
            Yakin Hapus Percakapan?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-start">
            Seluruh pesan percakapan akan dihapus, tindakan ini tidak dapat
            dibatalkan
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end">
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <Button
            variant={"destructive"}
            disabled={isLoading}
            onClick={async () => await handleDelete()}
          >
            Hapus
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
