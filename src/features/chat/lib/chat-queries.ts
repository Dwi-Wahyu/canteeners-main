"use server";

import { prisma } from "@/lib/prisma";

export async function getUserQuickChats(user_id: string) {
  return await prisma.quickChat.findMany({
    where: {
      user_id,
    },
  });
}
