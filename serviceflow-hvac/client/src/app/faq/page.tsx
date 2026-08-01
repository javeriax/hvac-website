import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { FAQS } from "@/lib/data";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently asked questions." />

      <section className="section-container max-w-3xl py-20">
        <div className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-brand-900">
                {faq.question}
                <span className="ml-4 text-stone-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-stone-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
