import { notFound } from "next/navigation";
import CanteenClient from "../../../features/canteen/ui/canteen-client";
import { getCanteenBySlug } from "@/features/canteen/lib/canteen-queries";
import { getCategories } from "@/features/category/lib/category-queries";

export default async function CanteenDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const validSlug = ["kantin-kudapan", "kantin-sosiologi", "kantin-sastra"];

  if (!slug.trim() || !validSlug.includes(slug)) {
    return notFound();
  }

  const canteen = await getCanteenBySlug(slug);

  if (!canteen) {
    return notFound();
  }

  const categories = await getCategories();

  return <CanteenClient canteen={canteen} categories={categories} />;
}
