import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";

export default async function FAQ() {
  const faq = await prisma.faq.findMany();

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase mb-2">FAQ</h1>

      <Skeleton className="w-full h-40" />
    </div>
  );
}
