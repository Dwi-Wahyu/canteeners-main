import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { prismaAccelerate } from "@/lib/prisma";

export default async function FAQ() {
  const faqs = await prismaAccelerate.faq.findMany();

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold uppercase mb-2">FAQ</h1>

      {faqs.length > 0 ? (
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue={"1"}
        >
          {faqs.map((item) => (
            <AccordionItem value={item.id.toString()} key={item.id}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center text-muted-foreground">Belum ada faq</div>
      )}
    </div>
  );
}
