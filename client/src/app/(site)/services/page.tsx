import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/brand';
import { PageHero } from '@/components/site/PageHero';
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconPhone,
  SERVICE_ICONS,
} from '@/components/icons';
import { COMPANY, SERVICES } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'HVAC installation, diagnostics and repair, preventive maintenance, inspections, duct cleaning, smart controls and 24/7 emergency response across the Phoenix metro.',
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        index="01"
        eyebrow="Services"
        title="Every service, priced as line items"
        lede="Seven service lines covering residential and light-commercial HVAC. Each one includes what it includes — no bundled mystery, no surprise add-ons after the van arrives."
        aside={
          <div className="rounded-card border border-line bg-surface p-5">
            <p className="text-2xs uppercase tracking-[0.14em] text-faint">Not sure what you need?</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
              Describe the symptom and we will diagnose it. Most calls resolve in a single visit.
            </p>
            <Link href="/request-quote" className="btn-primary btn-sm mt-4 w-full">
              Request a quote
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        }
      >
        {/* jump nav */}
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              className="rounded-pill border border-line bg-surface px-3.5 py-1.5 text-[12.5px] text-muted transition-colors hover:border-frost/35 hover:text-frost"
            >
              {s.name}
            </a>
          ))}
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <div className="space-y-4">
          {SERVICES.map((service, i) => {
            const Icon = SERVICE_ICONS[service.slug] ?? SERVICE_ICONS.repair;
            const emergency = service.slug === 'emergency';

            return (
              <Reveal key={service.slug} delay={i * 40}>
                <section
                  id={service.slug}
                  className={`scroll-mt-28 overflow-hidden rounded-card border bg-surface ${
                    emergency ? 'border-ember/30' : 'border-line'
                  }`}
                >
                  <div className="grid gap-8 p-7 lg:grid-cols-[0.95fr_1.05fr] lg:p-9">
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-11 w-11 place-items-center rounded-xl border ${
                            emergency
                              ? 'border-ember/30 bg-ember/10 text-ember'
                              : 'border-frost/25 bg-frost/[0.08] text-frost'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="index-mark opacity-60">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <h2 className="mt-5 text-[24px] font-semibold leading-tight">{service.name}</h2>
                      <p className={`mt-2 text-[14px] ${emergency ? 'text-ember' : 'text-frost'}`}>
                        {service.short}
                      </p>
                      <p className="mt-5 text-[14.5px] leading-relaxed text-muted">
                        {service.description}
                      </p>

                      <div className="mt-7 flex flex-wrap items-center gap-6 border-t border-line pt-5">
                        <div>
                          <p className="text-2xs uppercase tracking-[0.14em] text-faint">Starting at</p>
                          <p className="tnum mt-1 text-[19px] font-semibold">{service.startingAt}</p>
                        </div>
                        <div>
                          <p className="text-2xs uppercase tracking-[0.14em] text-faint">Typical duration</p>
                          <p className="mt-1 flex items-center gap-1.5 text-[14px] font-medium">
                            <IconClock className="h-3.5 w-3.5 text-muted" />
                            {service.duration}
                          </p>
                        </div>
                        <div className="ml-auto">
                          {emergency ? (
                            <a
                              href={`tel:${COMPANY.emergencyPhone.replace(/\D/g, '')}`}
                              className="btn-ember btn-sm"
                            >
                              <IconPhone className="h-3.5 w-3.5" />
                              Call now
                            </a>
                          ) : (
                            <Link
                              href={`/request-quote?service=${service.slug}`}
                              className="btn-primary btn-sm"
                            >
                              Request this
                              <IconArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-line bg-sunken p-6">
                      <p className="mb-4 text-2xs font-semibold uppercase tracking-[0.16em] text-faint">
                        What is included
                      </p>
                      <ul className="space-y-3">
                        {service.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-3 text-[14px] leading-snug">
                            <IconCheck
                              className={`mt-0.5 h-4 w-4 shrink-0 ${
                                emergency ? 'text-ember' : 'text-frost'
                              }`}
                            />
                            <span className="text-muted">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="mt-14 rounded-card border border-line bg-surface p-8 text-center">
            <h2 className="text-[22px] font-semibold">Something not on the list?</h2>
            <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-muted">
              Zoning, humidifiers, ERVs, walk-in refrigeration, mini split retrofits — if it moves
              air or changes temperature, describe it and we will tell you honestly whether we are
              the right people for it.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-ghost btn-sm">
                Ask a question
              </Link>
              <Link href="/request-quote" className="btn-primary btn-sm">
                Request a quote
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
