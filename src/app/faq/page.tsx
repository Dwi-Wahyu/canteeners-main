import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFaqs } from "./faq-actions";

export const dynamic = "force-dynamic";

export default async function FAQ({
  searchParams,
}: {
  searchParams: Promise<{ back_url?: string }>;
}) {
  const { back_url } = await searchParams;

  const faqs = await getFaqs();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b px-5 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href={back_url ? back_url : "/pusat-bantuan"}>
            <ChevronLeft className="size-6" />
          </Link>
        </Button>
        <h1 className="text-lg font-bold">FAQ</h1>
      </div>

      <div className="p-5">
        <h2 className="text-xl font-bold mb-6">
          Pertanyaan yang Sering Diajukan
        </h2>

        {faqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item) => (
              <AccordionItem value={item.id.toString()} key={item.id}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance text-muted-foreground">
                  <p>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            Belum ada FAQ yang tersedia.
          </div>
        )}
      </div>
    </div>
  );
}
