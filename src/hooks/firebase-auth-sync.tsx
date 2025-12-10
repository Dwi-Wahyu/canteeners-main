"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  signInWithCustomToken,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth as firebaseClientAuth } from "@/lib/firebase/client";

export const FirebaseAuthSync = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user.firebaseToken) {
      // User login di NextAuth, sekarang login ke Firebase
      signInWithCustomToken(firebaseClientAuth, session.user.firebaseToken)
        .then((userCredential) => {
          console.log("Firebase Auth Success:", userCredential.user.uid);
        })
        .catch((error) => {
          console.error("Firebase Auth Error:", error);
        });
    } else if (status === "unauthenticated") {
      // Jika user logout dari NextAuth, logout juga dari Firebase
      firebaseSignOut(firebaseClientAuth);
    }
  }, [session, status]);

  return null; // Komponen ini tidak merender apa-apa secara visual
};
