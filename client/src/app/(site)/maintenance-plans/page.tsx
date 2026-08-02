import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/brand';
import { PageHero } from '@/components/site/PageHero';
import { PlanGrid } from '@/components/site/PlanGrid';
import { IconCheck, IconClock, IconShield, IconX } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Maintenance Plans',
  description:
    'Annual HVAC maintenance agreements, scheduled tune-ups, repair discounts, priority scheduling and guaranteed response windows for homes and businesses.',
};

const COMPARISON = [
  { feature: 'Precision tune-ups per year', essential: '2', comfort: '3', elite: '4', commercial: '6' },
  { feature: '21-point inspection', essential: true, comfort: true, elite: true, commercial: true },
  { feature: 'Repair discount', essential: '10%', comfort: '15%', elite: '25%', commercial: '20%' },
  { feature: 'Guaranteed response', essential: '48 hrs', comfort: '24 hrs', elite: '4 hrs', commercial: '4 hrs' },
  { feature: 'Filters included', essential: true, comfort: true, elite: true, commercial: true },
  { feature: 'Waived diagnostic fee', essential: false, comfort: true, elite: true, commercial: true },
  { feature: 'Duct assessment', essential: false, comfort: true, elite: true, commercial: true },
  { feature: 'Annual duct cleaning', essential: false, comfort: false, elite: true, commercial: false },
  { feature: 'Covers multiple systems', essential: false, comfort: false, elite: 'up to 3', commercial: 'unlimited' },
  { feature: 'Extended labour warranty', essential: false, comfort: false, elite: '2 years', commercial: '2 years' },
  { feature: 'Compliance documentation', essential: false, comfort: false, elite: false, commercial: true },
  { feature: 'Dedicated account manager', essential: false, comfort: false, elite: true, commercial: true },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <IconCheck className="mx-auto h-4 w-4 text-frost" />;
  if (value === false) return <IconX className="mx-auto h-3.5 w-3.5 text-line" />;
  return <span className="tnum text-[13px] font-medium">{value}</span>;
}

export default function MaintenancePlansPage() {
  return (
    <>
      <PageHero
        index="02"
        eyebrow="Maintenance Plans"
        title="Pay for the tune-up, not the emergency"
        lede="Two thirds of the emergency calls we run in July trace back to something a spring tune-up would have caught, a drifting capacitor, a fouled coil, a blocked drain. A plan is simply the cheaper half of that equation."
        aside={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-card border border-line bg-surface px-5 py-4">
              <div className="flex items-center gap-2.5">
                <IconShield className="h-4 w-4 text-frost" />
                <p className="text-[13.5px] font-semibold">No lock-in</p>
              </div>
              <p className="mt-1.5 text-2xs leading-relaxed text-muted">
                Cancel any time from your dashboard. Auto-renew is yours to switch off.
              </p>
            </div>
            <div className="rounded-card border border-line bg-surface px-5 py-4">
              <div className="flex items-center gap-2.5">
                <IconClock className="h-4 w-4 text-ember" />
                <p className="text-[13.5px] font-semibold">Priority queue</p>
              </div>
              <p className="mt-1.5 text-2xs leading-relaxed text-muted">
                Members are dispatched ahead of non-members on the same severity.
              </p>
            </div>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <PlanGrid highlightPopular />
      </section>

      {/* comparison table */}
      <section className="border-y border-line bg-surface/40 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <h2 className="text-[26px] font-semibold">Line-by-line comparison</h2>
            <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-muted">
              Everything each plan includes, side by side. Commercial Assurance is priced per site
              and scales with the number of rooftop units.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <div className="scroll-x mt-9 rounded-card border border-line bg-surface">
              <table className="w-full min-w-[46rem] text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-5 py-4 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
                      Feature
                    </th>
                    {['Essential Care', 'Comfort Plus', 'Elite Total Care', 'Commercial'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-4 text-center text-[13px] font-semibold ${
                          i === 1 ? 'text-frost' : ''
                        }`}
                      >
                        {h}
                        {i === 1 && (
                          <span className="ml-1.5 rounded bg-frost/12 px-1.5 py-0.5 text-2xs uppercase">
                            popular
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={`border-b border-line last:border-0 ${
                        i % 2 ? 'bg-sunken/40' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5 text-[13.5px] text-muted">{row.feature}</td>
                      <td className="px-4 py-3.5 text-center"><Cell value={row.essential} /></td>
                      <td className="bg-frost/[0.04] px-4 py-3.5 text-center"><Cell value={row.comfort} /></td>
                      <td className="px-4 py-3.5 text-center"><Cell value={row.elite} /></td>
                      <td className="px-4 py-3.5 text-center"><Cell value={row.commercial} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 text-center lg:py-20">
        <Reveal>
          <h2 className="text-[26px] font-semibold">Ready to enrol?</h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
            Create an account and pick your plan from the dashboard, enrolment takes about a
            minute, and your first visit is scheduled automatically based on the season.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-primary">
              Create an account
            </Link>
            <Link href="/dashboard/customer/contracts" className="btn-ghost">
              Already a customer? Enrol here
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
