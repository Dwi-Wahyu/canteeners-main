"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function DeleteAllNotificationsButton() {
  const [user, setUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteAll = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const q = query(
        collection(db, "notifications"),
        where("recipientId", "==", user.uid),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.info("Tidak ada notifikasi untuk dihapus.");
        setIsDeleting(false);
        return;
      }

      const batch = writeBatch(db);
      querySnapshot.docs.forEach((document) => {
        batch.delete(doc(db, "notifications", document.id));
      });
      await batch.commit();
      toast.success("Semua notifikasi berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("Gagal menghapus semua notifikasi.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isDeleting}>
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Semua Notifikasi?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Semua riwayat notifikasi Anda
            akan dihapus secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAll}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
