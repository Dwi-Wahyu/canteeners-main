"use server";

import { signIn } from "@/config/auth";

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/kantin" });
}
