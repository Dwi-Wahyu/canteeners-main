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
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";

export function DeleteChatDialog({ chatId }: { chatId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsLoading(true);
    const docRef = doc(db, "chats", chatId);

    await deleteDoc(docRef);

    setIsOpen(false);
    router.push("/chat");
    setIsLoading(false);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={"ghost"} className="w-full">
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
