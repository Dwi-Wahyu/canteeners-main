import { notFound } from "next/navigation";
import CanteenClient from "./canteen-client";

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

  return <CanteenClient slug={slug} />;
}
