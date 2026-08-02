import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/site/PageHero';
import { FaqList } from '@/components/site/FaqList';
import { IconPhone } from '@/components/icons';
import { COMPANY, FAQS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers on emergency response times, quotation and diagnostic fees, maintenance plan value, warranties and how the ArcticAir customer portal works.',
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        index="05"
        eyebrow="FAQ"
        title="The questions we get asked most"
        lede="Straight answers, including the ones where the honest answer is “it depends” or “probably not yet”."
        aside={
          <div className="rounded-card border border-line bg-surface p-5 lg:w-[20rem]">
            <p className="text-[13.5px] font-semibold">Still stuck?</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Our dispatch team answers the phone during business hours and the emergency line
              around the clock.
            </p>
            <a
              href={`tel:${COMPANY.phone.replace(/\D/g, '')}`}
              className="btn-ghost btn-sm mt-4 w-full"
            >
              <IconPhone className="h-3.5 w-3.5" />
              <span className="tnum">{COMPANY.phone}</span>
            </a>
            <Link href="/contact" className="btn-primary btn-sm mt-2 w-full">
              Send a message
            </Link>
          </div>
        }
      />

      <section className="mx-auto max-w-4xl px-5 py-16 lg:py-20">
        <FaqList items={FAQS} />

        <div className="mt-14 rounded-card border border-line bg-surface p-8 text-center">
          <h2 className="text-[22px] font-semibold">Ready when you are</h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
            Describe the problem and get a line-item quote you can approve online. No account
            required to start.
          </p>
          <Link href="/request-quote" className="btn-primary mt-6">
            Request a quote
          </Link>
        </div>
      </section>
    </>
  );
}
