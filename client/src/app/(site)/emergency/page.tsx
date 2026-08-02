import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/brand';
import { PageHero } from '@/components/site/PageHero';
import {
  IconAlert,
  IconCheck,
  IconClock,
  IconFlame,
  IconPhone,
  IconShield,
  IconTruck,
} from '@/components/icons';
import { COMPANY } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Emergency Service',
  description:
    '24/7 emergency HVAC response across the Phoenix metro, total system failure, gas odours, electrical faults, water damage and commercial refrigeration.',
};

const TRIAGE = [
  {
    level: 'Call us immediately',
    tone: 'ember',
    items: [
      'Any smell of gas, leave the building first, then call',
      'Burning smell, smoke or scorching around the unit',
      'Sparking, tripping breakers or scorched wiring',
      'No cooling with an infant, elderly or medically vulnerable resident indoors',
      'Water actively damaging ceilings, drywall or flooring',
      'Commercial refrigeration losing temperature',
    ],
  },
  {
    level: 'Same-day, not life-safety',
    tone: 'warn',
    items: [
      'Complete cooling failure in extreme heat',
      'Complete heating failure on a freezing night',
      'System repeatedly tripping and restarting',
      'Loud grinding or metallic noise from the unit',
    ],
  },
  {
    level: 'Book a normal visit',
    tone: 'frost',
    items: [
      'One room not reaching temperature',
      'Higher-than-usual energy bill',
      'System overdue for a tune-up',
      'Thermostat behaving oddly but system running',
    ],
  },
];

const STEPS = [
  { icon: IconPhone, title: 'You call', body: 'A dispatcher answers, not a queue, not a voicemail box. We triage severity in the first thirty seconds.' },
  { icon: IconTruck, title: 'We dispatch', body: 'The nearest qualified technician is assigned and you receive their name, certifications and live ETA.' },
  { icon: IconShield, title: 'We stabilise', body: 'Safety first: gas isolated, power made safe, water stopped. Then we diagnose the actual fault.' },
  { icon: IconCheck, title: 'You approve', body: 'Emergency work still gets a priced approval before parts go in, unless it is a safety isolation, which we do immediately.' },
];

export default function EmergencyPage() {
  return (
    <>
      <PageHero
        index="08"
        eyebrow="Emergency Service"
        title={<>When it cannot wait <span className="thermal-text">until Monday</span></>}
        lede="Live dispatch, twenty-four hours a day, three hundred and sixty-five days a year. Median emergency response across the metro is two hours and four minutes."
        aside={
          <div className="rounded-card border border-ember/35 bg-ember/[0.06] p-6 text-center lg:w-[20rem]">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-ember/35 bg-ember/10 text-ember">
              <IconFlame className="h-5.5 w-5.5" />
            </span>
            <p className="mt-4 text-2xs uppercase tracking-[0.16em] text-faint">
              Emergency dispatch
            </p>
            <a
              href={`tel:${COMPANY.emergencyPhone.replace(/\D/g, '')}`}
              className="tnum mt-2 block text-[26px] font-semibold text-ember transition-opacity hover:opacity-85"
            >
              {COMPANY.emergencyPhone}
            </a>
            <p className="mt-3 text-2xs leading-relaxed text-muted">
              Answered by a person, every hour of every day.
            </p>
            <a
              href={`tel:${COMPANY.emergencyPhone.replace(/\D/g, '')}`}
              className="btn-ember btn-sm mt-5 w-full"
            >
              <IconPhone className="h-3.5 w-3.5" />
              Call now
            </a>
          </div>
        }
      />

      {/* triage */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <Reveal>
          <div className="flex items-start gap-3 rounded-card border border-ember/30 bg-ember/[0.05] px-5 py-4">
            <IconAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ember" />
            <p className="text-[13.5px] leading-relaxed text-muted">
              <span className="font-semibold text-ink">If you smell gas, leave the building
              first.</span>{' '}
              Do not switch anything on or off. Call us from outside, or call 911 if the smell is
              strong.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {TRIAGE.map((group, i) => (
            <Reveal key={group.level} delay={i * 70}>
              <div
                className={`h-full rounded-card border bg-surface p-6 ${
                  group.tone === 'ember'
                    ? 'border-ember/30'
                    : group.tone === 'warn'
                      ? 'border-warn/30'
                      : 'border-line'
                }`}
              >
                <h2
                  className={`text-[15.5px] font-semibold ${
                    group.tone === 'ember'
                      ? 'text-ember'
                      : group.tone === 'warn'
                        ? 'text-warn'
                        : 'text-frost'
                  }`}
                >
                  {group.level}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-snug">
                      <span
                        className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${
                          group.tone === 'ember'
                            ? 'bg-ember'
                            : group.tone === 'warn'
                              ? 'bg-warn'
                              : 'bg-frost'
                        }`}
                      />
                      <span className="text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
                {group.tone === 'frost' && (
                  <Link href="/request-quote" className="btn-ghost btn-sm mt-5 w-full">
                    Book a normal visit
                  </Link>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* how it runs */}
      <section className="border-y border-line bg-surface/40 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <h2 className="text-[26px] font-semibold">What happens after you call</h2>
            <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-muted">
              Emergency work is faster, not looser. You still get a named technician, a priced
              approval and a written report.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <div className="h-full bg-surface p-7">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-ember/25 bg-ember/[0.08] text-ember">
                      <s.icon className="h-4 w-4" />
                    </span>
                    <span className="index-mark opacity-60">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold">{s.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* response guarantee */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Elite Total Care members', value: '4 hours', note: 'Contractual guarantee, 24/7/365' },
            { label: 'Comfort Plus members', value: '24 hours', note: 'Priority ahead of non-members' },
            { label: 'Everyone else', value: '2h 04m', note: 'Recorded metro-wide median' },
          ].map((r, i) => (
            <Reveal key={r.label} delay={i * 70}>
              <div className="h-full rounded-card border border-line bg-surface p-6">
                <p className="flex items-center gap-2 text-2xs uppercase tracking-[0.14em] text-faint">
                  <IconClock className="h-3.5 w-3.5" />
                  {r.label}
                </p>
                <p className="tnum mt-3 text-[30px] font-semibold leading-none">{r.value}</p>
                <p className="mt-2.5 text-[13px] text-muted">{r.note}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 flex flex-col items-center gap-4 rounded-card border border-line bg-surface p-8 text-center">
            <h2 className="text-[22px] font-semibold">Not an emergency right now?</h2>
            <p className="max-w-lg text-[14px] leading-relaxed text-muted">
              A maintenance plan is the cheapest way to make sure the next one never happens, and
              if it does, you jump the queue.
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-3">
              <Link href="/maintenance-plans" className="btn-primary btn-sm">
                Compare plans
              </Link>
              <Link href="/request-quote" className="btn-ghost btn-sm">
                Book a service visit
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
