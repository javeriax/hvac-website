'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IconCheck, IconClock, IconShield, IconSpark } from '@/components/icons';
import { Skeleton } from '@/components/ui';
import { api } from '@/lib/api';
import { cx, money } from '@/lib/format';
import { MaintenancePlan } from '@/lib/types';

export function PlanGrid({
  highlightPopular,
  billing: controlledBilling,
  showToggle = true,
  limit,
}: {
  highlightPopular?: boolean;
  billing?: 'monthly' | 'annual';
  showToggle?: boolean;
  limit?: number;
}) {
  const [plans, setPlans] = useState<MaintenancePlan[] | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'annual'>(controlledBilling ?? 'annual');

  useEffect(() => {
    api
      .get<MaintenancePlan[]>('/contracts/plans')
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  if (!plans) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[26rem]" />
        ))}
      </div>
    );
  }

  const visible = limit ? plans.slice(0, limit) : plans;

  return (
    <>
      {showToggle && (
        <div className="mb-9 flex justify-center">
          <div className="inline-flex rounded-pill border border-line bg-sunken p-1">
            {(['annual', 'monthly'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setBilling(mode)}
                className={cx(
                  'rounded-pill px-4 py-1.5 text-[13px] font-medium capitalize transition-all',
                  billing === mode ? 'bg-surface text-ink shadow-lift' : 'text-muted hover:text-ink',
                )}
              >
                {mode}
                {mode === 'annual' && (
                  <span className="ml-1.5 text-2xs text-frost">save ~13%</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={cx('grid gap-4', visible.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
        {visible.map((plan) => {
          const featured = Boolean(highlightPopular && plan.isPopular);
          const price = billing === 'annual' ? plan.priceAnnual : plan.priceMonthly;

          return (
            <div
              key={plan._id}
              className={cx(
                'relative flex flex-col overflow-hidden rounded-card border bg-surface p-6 transition-all duration-300',
                featured
                  ? 'border-frost/45 shadow-glow-frost lg:-my-3 lg:py-9'
                  : 'border-line hover:border-frost/25',
              )}
            >
              {featured && (
                <>
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-thermal" />
                  <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-pill bg-frost/12 px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.12em] text-frost">
                    <IconSpark className="h-3 w-3" />
                    Popular
                  </span>
                </>
              )}

              <h3 className="text-[17px] font-semibold">{plan.name}</h3>
              <p className="mt-1.5 min-h-[2.5rem] text-[13px] leading-relaxed text-muted">
                {plan.tagline}
              </p>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="tnum text-[34px] font-semibold leading-none">
                  {money(price, { cents: false })}
                </span>
                <span className="text-[13px] text-muted">/{billing === 'annual' ? 'yr' : 'mo'}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-md bg-raised px-2 py-1 text-2xs text-muted">
                  <IconShield className="h-3 w-3 text-frost" />
                  {plan.visitsPerYear} visits/yr
                </span>
                <span className="flex items-center gap-1.5 rounded-md bg-raised px-2 py-1 text-2xs text-muted">
                  <IconClock className="h-3 w-3 text-frost" />
                  {plan.responseHours}h response
                </span>
                {plan.repairDiscountPercent > 0 && (
                  <span className="flex items-center gap-1.5 rounded-md bg-raised px-2 py-1 text-2xs text-muted">
                    −{plan.repairDiscountPercent}% repairs
                  </span>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] leading-snug">
                    <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-frost" />
                    <span className="text-muted">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/maintenance-plans?plan=${plan.slug}`}
                className={cx('mt-7 w-full', featured ? 'btn-primary' : 'btn-ghost')}
              >
                Choose {plan.name}
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
