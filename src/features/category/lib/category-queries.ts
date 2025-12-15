"use server";

import { prismaAccelerate } from "@/lib/prisma";

export async function getCategories() {
  return await prismaAccelerate.category.findMany();
}
