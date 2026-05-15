"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense, useEffect, useState } from "react";
import { getFaqs } from "./faq-actions";

export const dynamic = "force-dynamic";

function FAQContent() {
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("back_url") || "/pusat-bantuan";
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFaqs().then((data) => {
      setFaqs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b px-5 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href={backUrl}>
            <ChevronLeft className="size-6" />
          </Link>
        </Button>
        <h1 className="text-lg font-bold">FAQ</h1>
      </div>

      <div className="p-5">
        <h2 className="text-xl font-bold mb-6">
          Pertanyaan yang Sering Diajukan
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : faqs.length > 0 ? (
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

export default function FAQ() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Memuat...</div>}>
      <FAQContent />
    </Suspense>
  );
}
