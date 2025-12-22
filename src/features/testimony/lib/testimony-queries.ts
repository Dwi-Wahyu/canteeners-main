import { prisma } from "@/lib/prisma";

export async function getAppTestimonies(limit: number = 5) {
  return await prisma.appTestimony.findMany({
    orderBy: {
      created_at: "desc",
    },
    take: limit,
  });
}
