import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export async function getAppTestimonies(limit: number = 5) {
  return await unstable_cache(
    async () => {
      return await prisma.appTestimony.findMany({
        orderBy: [{ order: "asc" }, { created_at: "desc" }],
        take: limit,
      });
    },
    [`app-testimonies-${limit}`],
    {
      revalidate: 3600,
      tags: ["app-testimonies"],
    }
  )();
}
