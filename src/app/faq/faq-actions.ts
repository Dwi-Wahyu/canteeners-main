"use server";

import { prisma } from "@/lib/prisma";

export async function getFaqs() {
  return await prisma.faq.findMany();
}
