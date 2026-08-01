import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/brand';
import { PageHero } from '@/components/site/PageHero';
import { CoverageChecker } from '@/components/site/CoverageChecker';
import { IconClock, IconMapPin, IconTruck, IconUsers } from '@/components/icons';
import { SERVICE_AREAS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Service Areas',
  description:
    'ArcticAir HVAC covers twelve cities across the Phoenix metro — Phoenix, Scottsdale, Mesa, Tempe, Chandler, Gilbert, Glendale, Peoria and more.',
};

export default function ServiceAreasPage() {
  const totalTechs = SERVICE_AREAS.reduce((a, c) => a + c.techs, 0);

  return (
    <>
      <PageHero
        index="03"
        eyebrow="Service Areas"
        title="Twelve cities, measured response times"
        lede="These are median response times we actually recorded over the last twelve months — not marketing promises. Flagship cities carry a permanently stationed crew; outer cities are covered from the nearest depot."
        aside={<CoverageChecker />}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_AREAS.map((area, i) => (
            <Reveal key={area.city} delay={i * 40}>
              <div
                className={`group relative h-full overflow-hidden rounded-card border bg-surface p-6 transition-colors ${
                  area.flagship ? 'border-frost/30' : 'border-line hover:border-frost/25'
                }`}
              >
                {area.flagship && (
                  <span className="absolute right-5 top-5 rounded-pill bg-frost/12 px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.12em] text-frost">
                    Flagship
                  </span>
                )}

                <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-sunken text-frost">
                  <IconMapPin className="h-4.5 w-4.5" />
                </span>

                <h2 className="mt-5 text-[19px] font-semibold">{area.city}</h2>
                <p className="mt-1 text-2xs uppercase tracking-[0.16em] text-faint">
                  {area.state} · Maricopa County
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5">
                  <div>
                    <dt className="flex items-center gap-1.5 text-2xs uppercase tracking-[0.12em] text-faint">
                      <IconClock className="h-3 w-3" />
                      Median response
                    </dt>
                    <dd className="tnum mt-1.5 text-[17px] font-semibold">{area.response}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-2xs uppercase tracking-[0.12em] text-faint">
                      <IconUsers className="h-3 w-3" />
                      Technicians
                    </dt>
                    <dd className="tnum mt-1.5 text-[17px] font-semibold">{area.techs}</dd>
                  </div>
                </dl>

                <Link
                  href={`/request-quote?city=${encodeURIComponent(area.city)}`}
                  className="btn-ghost btn-sm mt-6 w-full"
                >
                  Book in {area.city}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 grid gap-4 rounded-card border border-line bg-surface p-8 sm:grid-cols-3">
            {[
              { icon: IconMapPin, value: `${SERVICE_AREAS.length}`, label: 'Cities covered' },
              { icon: IconUsers, value: `${totalTechs}`, label: 'Technicians on the road' },
              { icon: IconTruck, value: '2h 04m', label: 'Metro-wide emergency median' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-sunken text-frost">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="tnum text-[22px] font-semibold leading-none">{s.value}</p>
                  <p className="mt-1.5 text-[12.5px] text-muted">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <p className="mt-10 text-center text-[13.5px] text-muted">
            Outside these cities?{' '}
            <Link href="/contact" className="link-underline text-frost">
              Send us the address
            </Link>{' '}
            — we take selected work beyond the metro and will tell you honestly if you are better
            served by someone closer.
          </p>
        </Reveal>
      </section>
    </>
  );
}
