import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export async function getBanners() {
  return await unstable_cache(
    async () => {
      return await prisma.banner.findMany({
        orderBy: {
          order: "asc",
        },
      });
    },
    ["banners"],
    {
      revalidate: 3600,
      tags: ["banners"],
    }
  )();
}
