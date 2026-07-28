import Link from "next/link";
import { SERVICES, MAINTENANCE_PLANS, TESTIMONIALS, SERVICE_AREAS } from "@/lib/data";
import {
  SERVICE_ICONS,
  StarIcon,
  ShieldIcon,
  ClockIcon,
  CheckIcon,
  WrenchIcon,
  CalendarIcon,
} from "@/components/icons";
import Avatar from "@/components/Avatar";
import ServiceIconBadge from "@/components/ServiceIconBadge";

const HOW_IT_WORKS = [
  {
    icon: CalendarIcon,
    title: "Submit a request",
    body: "Tell us what's going on and pick a preferred date — takes about two minutes.",
  },
  {
    icon: CheckIcon,
    title: "Review your quote",
    body: "We send back an itemized quote with labor, equipment, and tax broken out separately.",
  },
  {
    icon: ClockIcon,
    title: "Get it scheduled",
    body: "Accept the quote and a technician is dispatched — track the whole thing by tracking code.",
  },
];

const TRUST_STATS = [
  { value: "35+", label: "Certified technicians" },
  { value: "12", label: "Years in business" },
  { value: "6", label: "Cities served" },
  { value: "24/7", label: "Emergency response" },
];

const WHY_US = [
  {
    icon: ShieldIcon,
    title: "Licensed & insured",
    body: "Fully licensed HVAC contractor with insured technicians on every job.",
  },
  {
    icon: ClockIcon,
    title: "Fast response",
    body: "Same-day appointments in most service areas, priority dispatch for emergencies.",
  },
  {
    icon: CheckIcon,
    title: "Upfront pricing",
    body: "Itemized quotes before any work begins — no surprise charges afterward.",
  },
  {
    icon: WrenchIcon,
    title: "All major brands",
    body: "Our technicians service and repair every major residential and commercial brand.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-glow relative overflow-hidden border-b border-stone-200 bg-brand-50">
        <div className="section-container relative grid gap-10 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-clay-600">
              Residential &amp; Commercial HVAC
            </p>
            <h1 className="text-5xl leading-[1.05] sm:text-6xl">
              Heating and cooling service you can schedule in minutes.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
              ArcticAir HVAC Solutions handles installation, repair, emergency
              service, and annual maintenance for homes and businesses across
              the region — request a quote online and track it end to end.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/request-quote" className="btn-primary">
                Request a Free Quote
              </Link>
              <Link href="/emergency-services" className="btn-secondary">
                Emergency Service
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {TRUST_STATS.map((stat) => (
              <div key={stat.label} className="card text-center">
                <div className="font-display text-4xl font-bold text-brand-700">{stat.value}</div>
                <div className="mt-1.5 text-sm text-stone-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-container py-20">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-clay-600">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl">From request to scheduled job in three steps.</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="relative">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="step-connector absolute left-[4.5rem] right-0 top-7 hidden h-px sm:block" />
              )}
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white shadow-card">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="font-display text-4xl font-bold text-brand-100">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-lg">{step.title}</h3>
              <p className="mt-1.5 text-sm text-stone-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services overview */}
      <section className="border-t border-stone-200 bg-stone-50 py-20">
        <div className="section-container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl">What we service</h2>
              <p className="mt-2 text-stone-600">Six core services, one point of contact.</p>
            </div>
            <Link href="/services" className="hidden text-sm font-medium text-brand-700 hover:underline sm:block">
              View all services →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => {
              const Icon = SERVICE_ICONS[service.slug];
              const featured = service.slug === "emergency";
              return (
                <div
                  key={service.slug}
                  className={`group card ${featured ? "border-brand-900 bg-brand-900 text-white" : ""}`}
                >
                  <ServiceIconBadge icon={Icon} index={featured ? 1 : index} />
                  <h3 className={`mt-4 text-base ${featured ? "text-white" : ""}`}>{service.name}</h3>
                  <p className={`mt-1.5 text-sm ${featured ? "text-brand-200" : "text-stone-600"}`}>
                    {service.summary}
                  </p>
                  {featured && (
                    <span className="mt-4 inline-block rounded-full bg-clay-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      24/7 dispatch
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <Link href="/services" className="mt-8 inline-block text-sm font-medium text-brand-700 hover:underline sm:hidden">
            View all services →
          </Link>
        </div>
      </section>

      {/* Why choose us */}
      <section>
        <div className="section-container py-20">
          <h2 className="text-3xl sm:text-4xl">Why customers choose ArcticAir</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((item, index) => (
              <div key={item.title} className="group">
                <ServiceIconBadge icon={item.icon} index={index} />
                <h3 className="mt-4 text-base">{item.title}</h3>
                <p className="mt-1.5 text-sm text-stone-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Maintenance plan teaser */}
      <section className="border-y border-stone-200 bg-stone-50 py-20">
        <div className="section-container grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-clay-600">
              Maintenance Plans
            </p>
            <h2 className="text-3xl sm:text-4xl">
              Avoid breakdowns with a scheduled maintenance contract.
            </h2>
            <p className="mt-3 text-stone-600">
              Annual plans include seasonal tune-ups, priority scheduling, and
              discounted repair labor. We track renewal dates and send
              reminders so coverage never lapses.
            </p>
            <Link href="/maintenance-plans" className="btn-primary mt-6 inline-flex">
              Compare Plans
            </Link>
          </div>
          <div className="card">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-clay-600">
              Most requested
            </div>
            <div className="text-xl font-semibold text-brand-900">
              {MAINTENANCE_PLANS[1].name} Plan
            </div>
            <div className="mt-1 text-3xl font-bold text-brand-700">{MAINTENANCE_PLANS[1].price}</div>
            <ul className="mt-5 space-y-2.5">
              {MAINTENANCE_PLANS[1].features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-stone-700">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-clay-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials preview */}
      <section className="texture-dots">
        <div className="section-container py-20">
          <h2 className="text-3xl sm:text-4xl">What customers say</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card bg-white/90 backdrop-blur-sm">
                <div className="flex gap-0.5 text-clay-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <p className="mt-3 text-sm text-stone-700">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <Avatar name={t.name} className="h-10 w-10 text-sm" />
                  <div>
                    <div className="text-sm font-medium text-brand-900">{t.name}</div>
                    <div className="text-xs text-stone-500">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service areas teaser */}
      <section className="section-container py-20">
        <h2 className="text-3xl sm:text-4xl">Where we work</h2>
        <p className="mt-2 max-w-2xl text-stone-600">
          Currently serving {SERVICE_AREAS.length} cities with same-day and
          next-day response.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {SERVICE_AREAS.map((area) => (
            <span
              key={area.city}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
            >
              {area.city}, {area.state}
            </span>
          ))}
        </div>
        <Link href="/service-areas" className="mt-6 inline-block text-sm font-medium text-brand-700 hover:underline">
          Full coverage map →
        </Link>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-800">
        <div className="section-container flex flex-col items-start justify-between gap-6 py-14 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl text-white sm:text-3xl">Ready to schedule service?</h2>
            <p className="mt-2 text-brand-200">Get an itemized quote back within one business day.</p>
          </div>
          <Link href="/request-quote" className="btn-accent">
            Request a Free Quote
          </Link>
        </div>
      </section>
    </>
  );
}
