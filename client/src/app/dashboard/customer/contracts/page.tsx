'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconRefresh,
  IconShield,
  IconSpark,
} from '@/components/icons';
import { Alert, Button, EmptyState, Meter, Modal, Pill, Skeleton, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { cx, fmtDate, money, relative, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { MaintenanceContract, MaintenancePlan } from '@/lib/types';

export default function CustomerContractsPage() {
  const { data: contracts, loading, reload } = useApi<MaintenanceContract[]>('/contracts');
  const { data: plans } = useApi<MaintenancePlan[]>('/contracts/plans');
  const { push, view } = useToasts();

  const [enrolPlan, setEnrolPlan] = useState<MaintenancePlan | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [busy, setBusy] = useState(false);
  const [renewOpen, setRenewOpen] = useState<MaintenanceContract | null>(null);

  const active = contracts?.find((c) => ['active', 'expiring'].includes(c.status));
  const history = (contracts ?? []).filter((c) => c._id !== active?._id);

  const enrol = async () => {
    if (!enrolPlan) return;
    setBusy(true);
    try {
      await api.post('/contracts', { plan: enrolPlan._id, billingCycle: billing });
      push(`${enrolPlan.name} activated`);
      setEnrolPlan(null);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not enrol', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const renew = async () => {
    if (!renewOpen) return;
    setBusy(true);
    try {
      await api.post(`/contracts/${renewOpen._id}/renew`, {});
      push('Contract renewed for another year');
      setRenewOpen(null);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not renew', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const toggleAutoRenew = async (contract: MaintenanceContract) => {
    try {
      await api.patch(`/contracts/${contract._id}/auto-renew`, { autoRenew: !contract.autoRenew });
      push(contract.autoRenew ? 'Auto-renew switched off' : 'Auto-renew switched on');
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not update', 'danger');
    }
  };

  return (
    <DashboardShell
      roles={['customer']}
      title="Maintenance plan"
      subtitle="Scheduled visits, renewal status and coverage"
    >
      {view}

      {loading && <Skeleton className="h-80" />}

      {!loading && (
        <div className="space-y-5">
          {active ? (
            <>
              {active.status === 'expiring' && (
                <Alert tone="warn" title="Your plan is up for renewal">
                  {active.planName} expires on {fmtDate(active.endDate)} ({relative(active.endDate)}).
                  Renew now to keep priority scheduling and your repair discount.
                </Alert>
              )}

              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-card border border-frost/30 bg-frost/[0.03] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-10 w-10 place-items-center rounded-xl border border-frost/25 bg-frost/10 text-frost">
                          <IconShield className="h-4.5 w-4.5" />
                        </span>
                        <div>
                          <h2 className="text-[19px] font-semibold">{active.planName}</h2>
                          <p className="tnum text-2xs text-muted">{active.contractNumber}</p>
                        </div>
                      </div>
                    </div>
                    <Pill tone={toneFor('contract', active.status)}>{titleCase(active.status)}</Pill>
                  </div>

                  <dl className="mt-6 grid gap-5 border-t border-line pt-5 sm:grid-cols-3">
                    <div>
                      <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Term</dt>
                      <dd className="mt-1.5 text-[13.5px] font-medium">
                        {fmtDate(active.startDate)} → {fmtDate(active.endDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Billing</dt>
                      <dd className="tnum mt-1.5 text-[13.5px] font-medium">
                        {money(active.amount, { cents: false })} / {active.billingCycle === 'annual' ? 'yr' : 'mo'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Auto-renew</dt>
                      <dd className="mt-1.5">
                        <button
                          onClick={() => toggleAutoRenew(active)}
                          className={cx(
                            'inline-flex items-center gap-2 rounded-pill border px-3 py-1 text-2xs font-semibold uppercase tracking-[0.1em] transition-colors',
                            active.autoRenew
                              ? 'border-ok/35 bg-ok/10 text-ok'
                              : 'border-line bg-sunken text-muted',
                          )}
                        >
                          <span className={cx('h-1.5 w-1.5 rounded-full', active.autoRenew ? 'bg-ok' : 'bg-faint')} />
                          {active.autoRenew ? 'On' : 'Off'}
                        </button>
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 border-t border-line pt-5">
                    <div className="mb-2 flex items-baseline justify-between text-2xs">
                      <span className="uppercase tracking-[0.12em] text-faint">Visits used this term</span>
                      <span className="tnum font-semibold">
                        {active.visitsUsed} / {active.visitsTotal}
                      </span>
                    </div>
                    <Meter value={active.visitsUsed} max={active.visitsTotal} />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setRenewOpen(active)}>
                      <IconRefresh className="h-3.5 w-3.5" />
                      Renew for another year
                    </Button>
                  </div>
                </div>

                {/* visit schedule */}
                <div className="rounded-card border border-line bg-surface p-6">
                  <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                    <IconCalendar className="h-4 w-4 text-frost" />
                    Scheduled visits
                  </h2>
                  <ol className="relative mt-5 space-y-4 border-l border-line pl-6">
                    {active.visits.map((v, i) => {
                      const done = v.status === 'completed';
                      const upcoming = !done && new Date(v.scheduledDate).getTime() > Date.now();
                      return (
                        <li key={`${v.scheduledDate}-${i}`} className="relative">
                          <span
                            className={cx(
                              'absolute -left-[1.79rem] top-1 grid h-3 w-3 place-items-center rounded-full border-2 bg-surface',
                              done ? 'border-ok' : upcoming ? 'border-frost' : 'border-line',
                            )}
                          />
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="text-[13.5px] font-medium">Visit {i + 1}</p>
                            <span
                              className={cx(
                                'text-2xs uppercase tracking-[0.1em]',
                                done ? 'text-ok' : upcoming ? 'text-frost' : 'text-faint',
                              )}
                            >
                              {titleCase(v.status)}
                            </span>
                          </div>
                          <p className="tnum mt-0.5 text-2xs text-muted">{fmtDate(v.scheduledDate)}</p>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-card border border-line bg-surface">
              <EmptyState icon={<IconShield className="h-5 w-5" />} title="You are not on a plan yet">
                Two tune-ups a year plus a standing repair discount typically costs less than a
                single emergency call-out. Pick one below to enrol instantly.
              </EmptyState>
            </div>
          )}

          {/* plan catalogue */}
          {!active && plans && (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className={cx(
                    'relative flex flex-col rounded-card border bg-surface p-5',
                    plan.isPopular ? 'border-frost/45' : 'border-line',
                  )}
                >
                  {plan.isPopular && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-pill bg-frost/12 px-2 py-0.5 text-2xs font-semibold uppercase tracking-[0.1em] text-frost">
                      <IconSpark className="h-3 w-3" />
                      Popular
                    </span>
                  )}
                  <h3 className="text-[16px] font-semibold">{plan.name}</h3>
                  <p className="mt-1.5 min-h-[2.5rem] text-[12.5px] leading-relaxed text-muted">
                    {plan.tagline}
                  </p>
                  <p className="tnum mt-4 text-[26px] font-semibold leading-none">
                    {money(plan.priceAnnual, { cents: false })}
                    <span className="text-[13px] font-normal text-muted">/yr</span>
                  </p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {plan.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-2xs leading-snug">
                        <IconCheck className="mt-0.5 h-3 w-3 shrink-0 text-frost" />
                        <span className="text-muted">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant={plan.isPopular ? 'primary' : 'ghost'}
                    className="mt-5 w-full"
                    onClick={() => {
                      setEnrolPlan(plan);
                      setBilling('annual');
                    }}
                  >
                    Enrol
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* history */}
          {history.length > 0 && (
            <div className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-[15px] font-semibold">Contract history</h2>
              <ul className="mt-4 divide-y divide-line">
                {history.map((c) => (
                  <li key={c._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-[13.5px] font-medium">{c.planName}</p>
                      <p className="tnum text-2xs text-muted">
                        {c.contractNumber} · {fmtDate(c.startDate)} → {fmtDate(c.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tnum text-[13px] text-muted">{money(c.amount, { cents: false })}</span>
                      <Pill tone={toneFor('contract', c.status)}>{titleCase(c.status)}</Pill>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* enrol modal */}
      <Modal
        open={enrolPlan !== null}
        onClose={() => setEnrolPlan(null)}
        title={`Enrol in ${enrolPlan?.name ?? ''}`}
        subtitle="Your first visit is scheduled automatically based on the season."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEnrolPlan(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={enrol} loading={busy}>
              Activate plan
            </Button>
          </>
        }
      >
        {enrolPlan && (
          <div className="space-y-4">
            <div>
              <span className="label">Billing cycle</span>
              <div className="flex gap-2">
                {(['annual', 'monthly'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    className={cx(
                      'flex-1 rounded-xl border px-4 py-3 text-left transition-colors',
                      billing === b ? 'border-frost/50 bg-frost/[0.06]' : 'border-line bg-sunken',
                    )}
                  >
                    <span className="block text-[13px] font-medium capitalize">{b}</span>
                    <span className="tnum mt-1 block text-[17px] font-semibold">
                      {money(b === 'annual' ? enrolPlan.priceAnnual : enrolPlan.priceMonthly, { cents: false })}
                      <span className="text-2xs font-normal text-muted">
                        /{b === 'annual' ? 'yr' : 'mo'}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <ul className="space-y-2 rounded-xl border border-line bg-sunken p-4">
              {enrolPlan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px]">
                  <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-frost" />
                  <span className="text-muted">{f}</span>
                </li>
              ))}
            </ul>

            <p className="flex items-start gap-2 text-2xs leading-relaxed text-faint">
              <IconClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              The plan runs for twelve months from today. You can switch auto-renew off or cancel at
              any time from this page.
            </p>
          </div>
        )}
      </Modal>

      {/* renew modal */}
      <Modal
        open={renewOpen !== null}
        onClose={() => setRenewOpen(null)}
        title="Renew your maintenance plan"
        subtitle="The new term begins where the current one ends — no gap in coverage."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRenewOpen(null)}>
              Not now
            </Button>
            <Button size="sm" onClick={renew} loading={busy}>
              <IconRefresh className="h-3.5 w-3.5" />
              Renew
            </Button>
          </>
        }
      >
        {renewOpen && (
          <div className="space-y-3 text-[13.5px]">
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <span className="text-muted">Plan</span>
              <span className="font-medium">{renewOpen.planName}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <span className="text-muted">New term starts</span>
              <span className="font-medium">{fmtDate(renewOpen.endDate)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted">Amount</span>
              <span className="tnum font-semibold text-frost">
                {money(renewOpen.amount, { cents: false })} / {renewOpen.billingCycle === 'annual' ? 'yr' : 'mo'}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
