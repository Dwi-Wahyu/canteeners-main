"use server";

import { prisma } from "@/lib/prisma";

export async function getUserByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user;
}
