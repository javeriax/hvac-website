import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal, SectionHeading } from '@/components/brand';
import { PageHero } from '@/components/site/PageHero';
import {
  IconGauge,
  IconShield,
  IconSpark,
  IconTruck,
  IconUsers,
} from '@/components/icons';
import { COMPANY, STATS, WHY_US } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'ArcticAir HVAC Solutions, 35 licensed staff serving the Phoenix metro since 2009 with measured diagnostics, transparent pricing and a customer portal that keeps every record.',
};

const TIMELINE = [
  {
    year: '2009',
    title: 'One van, one licence',
    body: 'Founded in a Phoenix garage servicing residential split systems. The founding principle, measure before you quote, has not changed since.',
  },
  {
    year: '2014',
    title: 'Commercial division opens',
    body: 'Added rooftop units and walk-in refrigeration after a bakery client asked us to cover a system nobody else would touch on a Sunday.',
  },
  {
    year: '2018',
    title: 'Maintenance agreements launch',
    body: 'Introduced annual plans after tracking that 68% of our emergency calls were preventable failures on unmaintained systems.',
  },
  {
    year: '2022',
    title: 'Metro-wide coverage',
    body: 'Reached twelve cities across Maricopa County with a second depot in Mesa and a permanent Scottsdale crew.',
  },
  {
    year: '2026',
    title: 'ServiceFlow goes live',
    body: 'Replaced spreadsheets, WhatsApp threads and paper carbon copies with a single platform customers and technicians both work inside.',
  },
];

const VALUES = [
  {
    icon: IconGauge,
    title: 'Measurement over opinion',
    body: 'Every diagnosis carries meter readings. Every replacement carries a load calculation. If we cannot show you the number, we do not make the claim.',
  },
  {
    icon: IconShield,
    title: 'The honest no',
    body: 'We tell customers when a system has years left, when a repair is not worth it, and when someone closer would serve them better. It costs us jobs and earns us the next ten.',
  },
  {
    icon: IconUsers,
    title: 'Technicians, not salespeople',
    body: 'Our field staff are paid on hours and quality scores, never on commission per system sold. The incentive to oversell simply does not exist here.',
  },
  {
    icon: IconTruck,
    title: 'Show up when we said',
    body: 'A four-hour window is a way of valuing our time over yours. You get a named technician, a live status, and a call if anything slips.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        index="04"
        eyebrow="About"
        title={<>A contractor built around <span className="thermal-text">measurement</span></>}
        lede={`${COMPANY.employees} licensed staff, ${new Date().getFullYear() - COMPANY.founded} years in the Valley, and a stubborn refusal to quote a system we have not measured. ArcticAir exists because too much of this trade runs on guesswork and a clipboard.`}
        aside={
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-card border border-line bg-surface px-4 py-3.5">
                <p className="tnum text-[21px] font-semibold leading-none">{s.value}</p>
                <p className="mt-2 text-2xs leading-snug text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        }
      />

      {/* story */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr]">
          <Reveal>
            <div className="max-w-2xl space-y-5 text-[15px] leading-relaxed text-muted">
              <p>
                ArcticAir started in {COMPANY.founded} with one van and a specific irritation: a
                customer had been sold a five-ton system for a house that needed three, by a
                contractor who never opened a duct. The system short-cycled for six years and cost
                them roughly double what it should have to run.
              </p>
              <p>
                That failure is not unusual. Most HVAC complaints trace back to one of two
                shortcuts, a system sized by looking at whatever was on the pad before it, or a
                repair quoted without a meter ever coming out of the bag. Both are fast. Both are
                wrong often enough to matter.
              </p>
              <p>
                So we built the company around the slower version. Every replacement quote includes
                a Manual J load calculation and a static pressure reading. Every diagnostic hands
                you the actual measurements, amp draw, superheat, subcooling, not just a verdict.
                It takes longer. It also means our callback rate sits under three percent.
              </p>
              <p>
                In {new Date().getFullYear()} we replaced the spreadsheets and WhatsApp threads with{' '}
                <span className="text-ink">{COMPANY.product}</span>, the platform this site runs on.
                Customers approve quotes online, watch the technician get assigned, and keep every
                reading and photo permanently. Our dispatchers stopped double-booking. Our
                technicians stopped filling in carbon copies in the dark.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-card border border-line bg-surface p-7">
              <span className="eyebrow">
                <IconSpark className="h-3.5 w-3.5 text-frost" />
                At a glance
              </span>
              <dl className="mt-6 space-y-4">
                {[
                  ['Founded', String(COMPANY.founded)],
                  ['Staff', `${COMPANY.employees} licensed employees`],
                  ['Coverage', '12 cities, Maricopa County'],
                  ['Licence', COMPANY.license],
                  ['Hours', COMPANY.hours],
                  ['Callback rate', 'Under 3% on completed work'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                    <dt className="text-2xs uppercase tracking-[0.14em] text-faint">{k}</dt>
                    <dd className="max-w-[60%] text-right text-[13px] font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* values */}
      <section className="border-y border-line bg-surface/40 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <SectionHeading index="—" eyebrow="How we operate" title="Four commitments we can be held to">
              These are not aspirations on a wall. Each one is something you can check us against on
              a single visit.
            </SectionHeading>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 70}>
                <div className="h-full rounded-card border border-line bg-surface p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-frost/25 bg-frost/[0.08] text-frost">
                    <v.icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="mt-5 text-[16px] font-semibold">{v.title}</h3>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* timeline */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <Reveal>
          <SectionHeading index="—" eyebrow="Timeline" title="Seventeen years, five turning points" />
        </Reveal>

        <div className="relative mt-12">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-line md:left-1/2" />
          <div className="space-y-8">
            {TIMELINE.map((t, i) => {
              const onLeft = i % 2 === 0;
              return (
                <Reveal key={t.year} delay={i * 60}>
                  <div className="relative pl-8 md:grid md:grid-cols-2 md:gap-12 md:pl-0">
                    {/* The dot is absolutely positioned, so it stays out of the grid
                        and always sits on the centre line no matter which side the
                        text is on. */}
                    <span className="absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 border-frost bg-page md:left-1/2 md:-translate-x-1/2" />

                    {/* Alternate sides by naming the column explicitly. */}
                    <div
                      className={
                        onLeft
                          ? 'md:col-start-1 md:pr-12 md:text-right'
                          : 'md:col-start-2 md:pl-12'
                      }
                    >
                      <p className="tnum text-[13px] font-semibold text-frost">{t.year}</p>
                      <h3 className="mt-1.5 text-[16px] font-semibold">{t.title}</h3>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{t.body}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* why us recap + CTA */}
      <section className="border-t border-line bg-surface/40 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((w, i) => (
              <Reveal key={w.title} delay={i * 50}>
                <div className="h-full rounded-card border border-line bg-surface p-5">
                  <span className="index-mark">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 text-[14.5px] font-semibold leading-snug">{w.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-12 flex flex-col items-center gap-4 text-center">
              <h2 className="text-[24px] font-semibold">Want to see how we work?</h2>
              <p className="max-w-lg text-[14px] leading-relaxed text-muted">
                Book a tune-up or an independent inspection. You will get the readings either way —
                whether or not you ever buy anything else from us.
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <Link href="/request-quote" className="btn-primary">
                  Request a quote
                </Link>
                <Link href="/testimonials" className="btn-ghost">
                  Read customer stories
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
