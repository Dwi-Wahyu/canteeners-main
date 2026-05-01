"use server";

import { prisma } from "@/lib/prisma";
import { cacheLife } from "next/cache";

export async function getBanners() {
  "use cache";
  cacheLife("hours");

  return await prisma.banner.findMany({
    orderBy: {
      order: "asc",
    },
  });
}
