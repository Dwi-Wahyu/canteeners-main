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

  useEffect(() => {
    const syncAuth = async () => {
      const firebaseToken = session?.user?.firebaseToken;

      if (status === "authenticated" && firebaseToken) {
        // JANGAN login jika:
        // 1. Sedang dalam proses login (isProcessing)
        // 2. User Firebase sudah ada dan UID-nya sama dengan yang di session
        if (
          isProcessing.current ||
          firebaseClientAuth.currentUser?.uid === session.user.id
        ) {
          return;
        }

        try {
          isProcessing.current = true;
          await signInWithCustomToken(firebaseClientAuth, firebaseToken);
          console.log(
            "Firebase Auth Success:",
            firebaseClientAuth.currentUser?.uid
          );
        } catch (error) {
          console.error("Firebase Auth Error:", error);
        } finally {
          isProcessing.current = false;
        }
      } else if (status === "unauthenticated") {
        if (firebaseClientAuth.currentUser) {
          await firebaseSignOut(firebaseClientAuth);
        }
      }
    };

    syncAuth();
    // Hanya pantau status dan token, jangan objek session secara utuh
  }, [status, session?.user?.firebaseToken]);

  return null;
};
