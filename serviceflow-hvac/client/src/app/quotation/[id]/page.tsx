import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import QuotationView from "@/components/QuotationView";

export const metadata: Metadata = { title: "Your Quotation" };

export default function QuotationPage({ params }: { params: { id: string } }) {
  return (
    <>
      <PageHero eyebrow="Quotation" title="Review your quotation." />
      <section className="section-container max-w-xl py-20">
        <QuotationView quotationId={params.id} />
      </section>
    </>
  );
}
