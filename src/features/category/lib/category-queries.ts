"use server";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// Private fetcher
const _getCategories = async () => {
  return await prisma.category.findMany();
};

// Cached version — 1 jam TTL, tag untuk invalidasi manual
export const getCategories = unstable_cache(_getCategories, ["categories"], {
  revalidate: 3600, // 1 jam — kategori sangat jarang berubah
  tags: ["categories"],
});
