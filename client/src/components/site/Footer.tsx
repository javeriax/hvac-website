import Link from 'next/link';
import { Logo } from '@/components/brand';
import { IconArrowUpRight, IconMail, IconMapPin, IconPhone } from '@/components/icons';
import { COMPANY, SERVICES, SERVICE_AREAS } from '@/lib/site';

const COLUMNS = [
  {
    title: 'Services',
    links: SERVICES.slice(0, 6).map((s) => ({ href: `/services#${s.slug}`, label: s.name })),
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About ArcticAir' },
      { href: '/maintenance-plans', label: 'Maintenance plans' },
      { href: '/service-areas', label: 'Service areas' },
      { href: '/testimonials', label: 'Customer stories' },
      { href: '/faq', label: 'Frequently asked' },
      { href: '/emergency', label: 'Emergency service' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/login', label: 'Sign in' },
      { href: '/register', label: 'Create an account' },
      { href: '/track', label: 'Track a request' },
      { href: '/request-quote', label: 'Request a quote' },
      { href: '/contact', label: 'Contact us' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-line bg-sunken">
      {/* thermal hairline across the top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-thermal opacity-50" />

      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo size={32} />
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-muted">
              Installation, emergency repair and preventive maintenance for homes and businesses
              across the Phoenix metro, running on {COMPANY.product}, our own service management
              platform.
            </p>

            <div className="mt-6 space-y-2.5 text-[13px]">
              <a
                href={`tel:${COMPANY.phone.replace(/\D/g, '')}`}
                className="flex items-center gap-2.5 text-muted transition-colors hover:text-frost"
              >
                <IconPhone className="h-3.5 w-3.5 shrink-0" />
                <span className="tnum">{COMPANY.phone}</span>
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-2.5 text-muted transition-colors hover:text-frost"
              >
                <IconMail className="h-3.5 w-3.5 shrink-0" />
                {COMPANY.email}
              </a>
              <p className="flex items-start gap-2.5 text-muted">
                <IconMapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {COMPANY.address}
              </p>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-2xs font-semibold uppercase tracking-[0.16em] text-faint">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-[13.5px] text-muted transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* service-area marquee */}
        <div className="relative mt-12 overflow-hidden border-y border-line py-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-sunken to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-sunken to-transparent" />
          <div className="flex w-max animate-marquee gap-8">
            {[...SERVICE_AREAS, ...SERVICE_AREAS].map((a, i) => (
              <span
                key={`${a.city}-${i}`}
                className="flex shrink-0 items-center gap-2 font-mono text-2xs uppercase tracking-[0.18em] text-faint"
              >
                <span className="h-1 w-1 rounded-full bg-frost/60" />
                {a.city}, {a.state}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 text-xs text-faint md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. {COMPANY.license}
          </p>
          <p className="flex items-center gap-1.5">
            {COMPANY.product} platform built by BranDive Media Solutions
            <IconArrowUpRight className="h-3 w-3" />
          </p>
        </div>
      </div>
    </footer>
  );
}
