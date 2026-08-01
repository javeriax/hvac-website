import Link from 'next/link';
import { Reveal, SectionHeading, ThermostatDial } from '@/components/brand';
import { ServiceCard } from '@/components/site/ServiceCard';
import { PlanGrid } from '@/components/site/PlanGrid';
import { TestimonialWall } from '@/components/site/TestimonialWall';
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconFlame,
  IconMapPin,
  IconPhone,
  IconShield,
  IconSnowflake,
  IconSpark,
  IconTruck,
} from '@/components/icons';
import { COMPANY, PROCESS, SERVICES, SERVICE_AREAS, STATS, WHY_US } from '@/lib/site';

export default function HomePage() {
  return (
    <>
      {/* ================================== hero ================================== */}
      <section className="relative overflow-hidden">
        {/* thermal ambience */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(58rem 34rem at 12% -8%, rgb(var(--c-frost) / 0.13), transparent 62%),' +
              'radial-gradient(46rem 30rem at 96% 6%, rgb(var(--c-ember) / 0.10), transparent 60%)',
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:pb-28 lg:pt-20">
          <div className="stack-fade">
            <div className="inline-flex items-center gap-2.5 rounded-pill border border-line bg-surface/70 py-1.5 pl-2 pr-4 backdrop-blur">
              <span className="flex items-center gap-1 rounded-pill bg-thermal-soft px-2 py-1">
                <IconSnowflake className="h-3 w-3 text-frost" />
                <IconFlame className="h-3 w-3 text-ember" />
              </span>
              <span className="text-2xs font-medium uppercase tracking-[0.16em] text-muted">
                Serving the Phoenix metro since {COMPANY.founded}
              </span>
            </div>

            <h1 className="mt-7 text-[clamp(2.5rem,6vw,4.3rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
              Climate control,
              <br />
              <span className="thermal-text">under control.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-muted">
              Installation, emergency repair and preventive maintenance for homes and businesses
              across Arizona — with a portal that shows you the quote, the technician, the readings
              and the report. No four-hour windows. No mystery invoices.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/request-quote" className="btn-primary">
                Request a free quote
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <a href={`tel:${COMPANY.emergencyPhone.replace(/\D/g, '')}`} className="btn-ghost">
                <IconPhone className="h-4 w-4 text-ember" />
                <span className="tnum">{COMPANY.emergencyPhone}</span>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
              {[
                'No-charge replacement quotes',
                'Diagnostic fee credited to repairs',
                'Licensed, bonded & insured',
              ].map((t) => (
                <span key={t} className="flex items-center gap-2 text-[13px] text-muted">
                  <IconCheck className="h-3.5 w-3.5 shrink-0 text-frost" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* dial + floating telemetry */}
          <div className="relative mx-auto w-full max-w-[26rem] lg:max-w-none">
            <div className="relative animate-drift">
              <ThermostatDial />
            </div>

            <div className="absolute -left-2 top-6 hidden animate-fade-up rounded-xl border border-line bg-surface/85 px-3.5 py-2.5 shadow-lift backdrop-blur sm:block">
              <p className="text-2xs uppercase tracking-[0.14em] text-faint">Technician</p>
              <p className="mt-1 flex items-center gap-2 text-[13px] font-medium">
                <IconTruck className="h-3.5 w-3.5 text-frost" />
                Marcus D. · en route
              </p>
              <p className="tnum mt-1 text-2xs text-muted">ETA 14 min · 3.2 mi</p>
            </div>

            <div
              className="absolute -right-2 bottom-10 hidden animate-fade-up rounded-xl border border-line bg-surface/85 px-3.5 py-2.5 shadow-lift backdrop-blur sm:block"
              style={{ animationDelay: '.25s' }}
            >
              <p className="text-2xs uppercase tracking-[0.14em] text-faint">Median response</p>
              <p className="tnum mt-1 text-[19px] font-semibold text-ember">2h 04m</p>
              <p className="text-2xs text-muted">across 1,240 emergency calls</p>
            </div>
          </div>
        </div>

        {/* stat rail */}
        <div className="relative border-y border-line bg-surface/40">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-line px-5 md:grid-cols-4 md:divide-x">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 70}>
                <div className="px-2 py-7 md:px-8">
                  <p className="tnum text-[26px] font-semibold leading-none">{s.value}</p>
                  <p className="mt-2 text-[12.5px] leading-snug text-muted">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================ services ================================ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            index="01"
            eyebrow="What we do"
            title="Seven services, one accountable trail"
            action={
              <Link href="/services" className="btn-ghost btn-sm">
                All services
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            Everything from a ninety-minute tune-up to a full commercial rooftop changeout — priced
            as line items, documented with readings, and recorded permanently in your account.
          </SectionHeading>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.slug} delay={i * 55}>
              <ServiceCard service={s} index={i} />
            </Reveal>
          ))}

          {/* emergency call-out tile completes the 8-cell grid */}
          <Reveal delay={SERVICES.length * 55}>
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-card border border-ember/25 bg-ember/[0.05] p-6">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ember/15 blur-3xl"
              />
              <div className="relative">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-ember/30 bg-ember/10 text-ember">
                  <IconFlame className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-[17px] font-semibold">System down right now?</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">
                  Live dispatch, 24 hours a day. Total failures in extreme heat and any gas or
                  electrical concern jump the queue.
                </p>
              </div>
              <a
                href={`tel:${COMPANY.emergencyPhone.replace(/\D/g, '')}`}
                className="btn-ember btn-sm relative mt-6 w-full"
              >
                <IconPhone className="h-3.5 w-3.5" />
                <span className="tnum">{COMPANY.emergencyPhone}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================= process ================================ */}
      <section className="relative border-y border-line bg-surface/40 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <SectionHeading index="02" eyebrow="How it works" title="Four steps, no phone tag">
              The whole job runs through one thread — request, quote, visit, report. You can watch
              every stage of it without calling anyone.
            </SectionHeading>
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 80}>
                <div className="group relative h-full bg-surface p-7 transition-colors hover:bg-raised">
                  <span className="tnum text-[32px] font-semibold leading-none text-line transition-colors group-hover:text-frost/40">
                    {p.step}
                  </span>
                  <h3 className="mt-4 text-[15.5px] font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">{p.body}</p>
                  <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-thermal transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================== plans ================================= */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            index="03"
            eyebrow="Maintenance plans"
            title="Cover the system before it costs you a July"
            align="center"
          >
            Two tune-ups a year, a standing repair discount and a guaranteed response window —
            typically cheaper than one emergency call-out.
          </SectionHeading>
        </Reveal>

        <div className="mt-14">
          <PlanGrid highlightPopular />
        </div>

        <p className="mt-8 text-center text-[13px] text-muted">
          Not sure which fits?{' '}
          <Link href="/maintenance-plans" className="link-underline text-frost">
            Compare every plan side by side
          </Link>
          .
        </p>
      </section>

      {/* ================================= why us ================================= */}
      <section className="relative border-y border-line bg-surface/40 py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <SectionHeading index="04" eyebrow="Why ArcticAir" title="Measured, not guessed">
                Most HVAC complaints trace back to one of two things: a system sized by eyeballing
                the old one, or a repair quoted without a meter. We built the company around
                removing both.
              </SectionHeading>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/about" className="btn-ghost btn-sm">
                  About the company
                </Link>
                <Link href="/testimonials" className="btn-ghost btn-sm">
                  Customer stories
                </Link>
              </div>

              <div className="mt-10 rounded-card border border-line bg-surface p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-frost/25 bg-frost/10 text-frost">
                    <IconShield className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-semibold">Workmanship guarantee</p>
                    <p className="text-2xs text-muted">90 days on repairs · 2 years on installs</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {WHY_US.map((w, i) => (
              <Reveal key={w.title} delay={i * 70}>
                <div className="h-full rounded-card border border-line bg-surface p-6">
                  <span className="index-mark">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 text-[15.5px] font-semibold leading-snug">{w.title}</h3>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== testimonials ============================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            index="05"
            eyebrow="In their words"
            title="What people say once the van has gone"
            action={
              <Link href="/testimonials" className="btn-ghost btn-sm">
                Read more
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
        </Reveal>

        <div className="mt-12">
          <TestimonialWall limit={6} />
        </div>
      </section>

      {/* =============================== coverage ================================ */}
      <section className="relative border-t border-line bg-surface/40 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <SectionHeading
              index="06"
              eyebrow="Coverage"
              title="Twelve cities across the Valley"
              action={
                <Link href="/service-areas" className="btn-ghost btn-sm">
                  Check your address
                  <IconMapPin className="h-3.5 w-3.5" />
                </Link>
              }
            >
              Response windows are measured, not promised — these are the medians we actually hit
              over the last twelve months.
            </SectionHeading>
          </Reveal>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_AREAS.map((a, i) => (
              <Reveal key={a.city} delay={i * 35}>
                <div className="group flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3.5 transition-colors hover:border-frost/30">
                  <div className="flex items-center gap-2.5">
                    <IconMapPin
                      className={`h-3.5 w-3.5 ${a.flagship ? 'text-frost' : 'text-faint'}`}
                    />
                    <span className="text-[13.5px] font-medium">{a.city}</span>
                  </div>
                  <span className="tnum flex items-center gap-1.5 text-2xs text-muted">
                    <IconClock className="h-3 w-3" />
                    {a.response}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================== CTA =================================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[20px] border border-line bg-surface px-7 py-14 text-center sm:px-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(40rem 20rem at 20% 0%, rgb(var(--c-frost) / 0.14), transparent 60%),' +
                  'radial-gradient(36rem 18rem at 85% 100%, rgb(var(--c-ember) / 0.14), transparent 60%)',
              }}
            />
            <div className="relative">
              <span className="eyebrow justify-center">
                <IconSpark className="h-3.5 w-3.5 text-frost" />
                Ninety seconds, no account needed
              </span>
              <h2 className="mx-auto mt-5 max-w-2xl text-[clamp(1.8rem,4vw,2.9rem)] font-semibold leading-[1.08]">
                Tell us what the system is doing.
                <br />
                <span className="thermal-text">We will tell you what it costs.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
                Attach a photo, pick a window, and get a line-item quotation you can approve or
                decline online. Nothing starts until you say so.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link href="/request-quote" className="btn-primary">
                  Request a quote
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/track" className="btn-ghost">
                  Track an existing request
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
