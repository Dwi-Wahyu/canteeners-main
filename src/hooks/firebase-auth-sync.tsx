"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import {
  signInWithCustomToken,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth as firebaseClientAuth } from "@/lib/firebase/client";

export const FirebaseAuthSync = () => {
  const { data: session, status } = useSession();
  // Gunakan Ref untuk mengunci proses agar tidak terjadi balapan (race condition)
  const isProcessing = useRef(false);
  const lastSyncedToken = useRef<string | null>(null);

  useEffect(() => {
    const syncAuth = async () => {
      const firebaseToken = session?.user?.firebaseToken;

      if (status === "authenticated" && firebaseToken) {
        // JANGAN login jika sedang dalam proses atau token sudah pernah disinkronkan
        if (isProcessing.current || lastSyncedToken.current === firebaseToken) {
          return;
        }

        try {
          isProcessing.current = true;
          await signInWithCustomToken(firebaseClientAuth, firebaseToken);
          lastSyncedToken.current = firebaseToken;
          console.log(
            "Firebase Auth Success:",
            firebaseClientAuth.currentUser?.uid
          );
        } catch (error) {
          console.error("Firebase Auth Error:", error);
          // Jika token invalid, reset lastSyncedToken agar bisa dicoba lagi jika session diupdate
          lastSyncedToken.current = null;
        } finally {
          isProcessing.current = false;
        }
      } else if (status === "unauthenticated") {
        if (firebaseClientAuth.currentUser) {
          await firebaseSignOut(firebaseClientAuth);
          lastSyncedToken.current = null;
        }
      }
    };

    syncAuth();
    // Hanya pantau status dan token, jangan objek session secara utuh
  }, [status, session?.user?.firebaseToken]);

  return null;
};
