"use server";

import { prisma } from "@/lib/prisma";

export async function getBanners() {
  return await prisma.banner.findMany({
    orderBy: {
      order: "asc",
    },
  });
}
