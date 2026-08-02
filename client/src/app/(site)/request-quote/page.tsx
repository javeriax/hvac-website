import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHero } from '@/components/site/PageHero';
import { ServiceRequestForm } from '@/components/site/ServiceRequestForm';
import { Skeleton } from '@/components/ui';
import { IconCheck, IconClock, IconShield } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Request a Quote',
  description:
    'Describe your HVAC issue, attach photos and pick a preferred window. Receive a line-item quotation you can approve or decline online, no account required.',
};

const ASSURANCES = [
  { icon: IconClock, title: 'Reviewed same day', body: 'A dispatcher looks at every request within business hours.' },
  { icon: IconCheck, title: 'Line-item pricing', body: 'Labour, equipment, tax and any discount shown separately.' },
  { icon: IconShield, title: 'No obligation', body: 'Approve or decline online. Nothing starts until you say so.' },
];

export default function RequestQuotePage() {
  return (
    <>
      <PageHero
        index="09"
        eyebrow="Request a Quote"
        title="Ninety seconds, no account required"
        lede="Tell us what the system is doing and where it lives. You will get a tracking code immediately and a priced quotation to approve or decline."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
          <Suspense fallback={<Skeleton className="h-[40rem]" />}>
            <ServiceRequestForm />
          </Suspense>

          <aside className="space-y-3 lg:sticky lg:top-28">
            {ASSURANCES.map((a) => (
              <div key={a.title} className="flex items-start gap-3.5 rounded-card border border-line bg-surface p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-frost/25 bg-frost/[0.08] text-frost">
                  <a.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold">{a.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{a.body}</p>
                </div>
              </div>
            ))}

            <div className="rounded-card border border-line bg-sunken p-5">
              <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-faint">
                What happens next
              </p>
              <ol className="mt-4 space-y-3">
                {[
                  'A dispatcher reviews and may call to clarify.',
                  'You receive a line-item quotation by email and in your portal.',
                  'Approve it, and a technician is scheduled against your preferred window.',
                  'After the visit, the report, photos and invoice land in your account.',
                ].map((t, i) => (
                  <li key={t} className="flex gap-3 text-[13px] leading-snug">
                    <span className="tnum shrink-0 text-frost">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-muted">{t}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
