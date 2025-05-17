import { useTranslation } from "@/lib/i18n";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqSection() {
  const { t } = useTranslation();
  
  const faqs = [
    {
      question: t("faq.question_1"),
      answer: t("faq.answer_1"),
    },
    {
      question: t("faq.question_2"),
      answer: t("faq.answer_2"),
    },
    {
      question: t("faq.question_3"),
      answer: t("faq.answer_3"),
    },
    {
      question: t("faq.question_4"),
      answer: t("faq.answer_4"),
    },
    {
      question: t("faq.question_5"),
      answer: t("faq.answer_5"),
    },
  ];

  return (
    <section className="py-16 bg-card relative diagonal-box">
      <div className="absolute inset-0 tech-pattern opacity-20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-cyber text-3xl md:text-4xl font-bold mb-4">
            {t("faq.title_1")} <span className="text-[#00ff66] neon-text">{t("faq.title_2")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("faq.subtitle")}
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="bg-background border border-muted/30 rounded-lg overflow-hidden px-0"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                  <h3 className="font-cyber text-lg font-semibold">{faq.question}</h3>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
