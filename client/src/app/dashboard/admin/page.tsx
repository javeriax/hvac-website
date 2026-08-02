'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AreaChart, BarChart, DonutChart, StatTile } from '@/components/charts';
import {
  IconCheck,
  IconChart,
  IconClock,
  IconReceipt,
  IconShield,
  IconStar,
  IconTrendUp,
  IconTruck,
  IconUsers,
  IconWrench,
} from '@/components/icons';
import { Avatar, Meter, Pill, Skeleton, Tabs } from '@/components/ui';
import { compactMoney, fmtDate, money, num, relative, serviceLabel, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { AnalyticsOverview, Job, User } from '@/lib/types';

const CHART_TABS = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'customers', label: 'Customer growth' },
];

export default function AdminAnalyticsPage() {
  const { data, loading } = useApi<AnalyticsOverview>('/analytics/overview');
  const [chart, setChart] = useState('revenue');

  const jobDonut = useMemo(() => {
    if (!data) return [];
    const s = data.jobs.byStatus;
    return [
      { label: 'completed', value: s.completed ?? 0, tone: 'rgb(var(--c-ok))' },
      { label: 'in progress', value: s.in_progress ?? 0, tone: 'rgb(var(--c-ember))' },
      { label: 'assigned', value: s.assigned ?? 0, tone: 'rgb(var(--c-info))' },
      { label: 'en route', value: s.en_route ?? 0, tone: 'rgb(var(--c-warn))' },
      { label: 'unassigned', value: s.unassigned ?? 0, tone: 'rgb(var(--c-danger))' },
      { label: 'cancelled', value: s.cancelled ?? 0, tone: 'rgb(var(--c-faint))' },
    ].filter((d) => d.value > 0);
  }, [data]);

  const revenueSpark = data?.charts.revenueByMonth.slice(-7).map((r) => r.value) ?? [];

  return (
    <DashboardShell
      roles={['admin']}
      title="Business analytics"
      subtitle="Revenue, operations and team performance"
      actions={
        <Link href="/dashboard/admin/invoices" className="btn-ghost btn-sm">
          <IconReceipt className="h-3.5 w-3.5" />
          Invoices
        </Link>
      }
    >
      {loading || !data ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[8.5rem]" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* headline revenue */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Revenue today"
              value={money(data.revenue.today, { cents: false })}
              icon={<IconTrendUp className="h-4 w-4" />}
              hint={`${data.revenue.todayPayments} payment(s) received`}
              tone="frost"
            />
            <StatTile
              label="Revenue this month"
              value={money(data.revenue.month, { cents: false })}
              delta={data.revenue.growthPercent}
              icon={<IconChart className="h-4 w-4" />}
              hint={`vs ${money(data.revenue.lastMonth, { cents: false })} last month`}
              spark={revenueSpark}
            />
            <StatTile
              label="Outstanding"
              value={money(data.revenue.outstanding, { cents: false })}
              icon={<IconClock className="h-4 w-4" />}
              tone="ember"
              hint={`${data.revenue.outstandingCount} unpaid invoice(s)`}
              href="/dashboard/admin/invoices"
            />
            <StatTile
              label="Lifetime revenue"
              value={money(data.revenue.lifetime, { cents: false })}
              icon={<IconReceipt className="h-4 w-4" />}
              tone="ok"
              hint="All settled payments"
            />
          </div>

          {/* operations row */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Completed jobs"
              value={num(data.jobs.completed)}
              icon={<IconCheck className="h-4 w-4" />}
              tone="ok"
              hint={`${data.jobs.total} jobs in total`}
            />
            <StatTile
              label="Pending jobs"
              value={num(data.jobs.pending)}
              icon={<IconTruck className="h-4 w-4" />}
              tone={data.jobs.unassigned ? 'danger' : 'warn'}
              hint={`${data.jobs.unassigned} unassigned · ${data.jobs.inProgress} in progress`}
              href="/dashboard/dispatcher"
            />
            <StatTile
              label="Customers"
              value={num(data.people.customers)}
              icon={<IconUsers className="h-4 w-4" />}
              tone="frost"
              hint={`${data.people.technicians} technicians on staff`}
              href="/dashboard/admin/customers"
            />
            <StatTile
              label="Active contracts"
              value={num(data.contracts.active + data.contracts.expiring)}
              icon={<IconShield className="h-4 w-4" />}
              tone={data.contracts.expiring ? 'warn' : 'ok'}
              hint={`${money(data.contracts.recurringValue, { cents: false })} recurring · ${data.contracts.expiring} expiring`}
              href="/dashboard/admin/contracts"
            />
          </div>

          {/* main chart */}
          <div className="rounded-card border border-line bg-surface p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-semibold">
                  {chart === 'revenue' ? 'Revenue, last 12 months' : 'New customers, last 12 months'}
                </h2>
                <p className="mt-0.5 text-[12.5px] text-muted">
                  {chart === 'revenue'
                    ? 'Settled payments by month, hover any point for the exact figure.'
                    : 'Accounts created per month.'}
                </p>
              </div>
              <div className="w-full sm:w-auto">
                <Tabs tabs={CHART_TABS} active={chart} onChange={setChart} />
              </div>
            </div>

            {chart === 'revenue' ? (
              <AreaChart
                data={data.charts.revenueByMonth}
                height={250}
                format={(v) => compactMoney(v)}
              />
            ) : (
              <AreaChart
                data={data.charts.customersByMonth}
                height={250}
                tone="ember"
                format={(v) => String(Math.round(v))}
              />
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* job status donut */}
            <div className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-[15px] font-semibold">Job status breakdown</h2>
              <p className="mt-0.5 text-[12.5px] text-muted">Every job ever booked, by current state.</p>
              <div className="mt-6">
                <DonutChart
                  data={jobDonut}
                  centerValue={String(data.jobs.total)}
                  centerLabel="total jobs"
                />
              </div>
            </div>

            {/* most requested services */}
            <div className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-[15px] font-semibold">Most requested services</h2>
              <p className="mt-0.5 text-[12.5px] text-muted">
                Across every service request, all time.
              </p>
              <div className="mt-6">
                <BarChart
                  horizontal
                  data={data.charts.serviceMix.map((s) => ({
                    label: serviceLabel(s.label),
                    value: s.value,
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            {/* technician leaderboard */}
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-semibold">Technician performance</h2>
                  <p className="mt-0.5 text-[12.5px] text-muted">Completed jobs and hours on site.</p>
                </div>
                <Link
                  href="/dashboard/admin/technicians"
                  className="text-2xs uppercase tracking-[0.12em] text-frost hover:opacity-80"
                >
                  Roster
                </Link>
              </div>

              <ul className="mt-5 space-y-3">
                {data.charts.technicianPerformance.map((t, i) => {
                  const top = data.charts.technicianPerformance[0]?.completed || 1;
                  return (
                    <li key={t._id} className="flex items-center gap-3">
                      <span className="tnum w-5 shrink-0 text-2xs text-faint">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <Avatar name={t.name} src={t.avatarUrl} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="truncate text-[13.5px] font-medium">{t.name}</p>
                          <span className="tnum shrink-0 text-[13px] font-semibold">
                            {t.completed}
                          </span>
                        </div>
                        <Meter
                          value={t.completed}
                          max={top}
                          tone={i === 0 ? 'ember' : 'frost'}
                          className="mt-1.5"
                        />
                        <p className="mt-1 flex items-center gap-3 text-2xs text-muted">
                          <span className="tnum flex items-center gap-1">
                            <IconStar className="h-3 w-3 text-ember" />
                            {(t.rating ?? 5).toFixed(1)}
                          </span>
                          <span className="tnum">{t.hours}h on site</span>
                          <span className="truncate">{(t.skills ?? []).slice(0, 2).join(' · ')}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* recent completions + contract health */}
            <div className="space-y-5">
              <div className="rounded-card border border-line bg-surface p-5">
                <h2 className="text-[15px] font-semibold">Maintenance contract health</h2>
                <div className="mt-5 space-y-4">
                  {[
                    { label: 'Active', value: data.contracts.active, tone: 'ok' as const },
                    { label: 'Expiring within 60 days', value: data.contracts.expiring, tone: 'warn' as const },
                    { label: 'Expired', value: data.contracts.expired, tone: 'danger' as const },
                  ].map((row) => {
                    const total =
                      data.contracts.active + data.contracts.expiring + data.contracts.expired || 1;
                    return (
                      <div key={row.label}>
                        <div className="mb-1.5 flex items-baseline justify-between text-[12.5px]">
                          <span className="text-muted">{row.label}</span>
                          <span className="tnum font-semibold">{row.value}</span>
                        </div>
                        <Meter value={row.value} max={total} tone={row.tone} />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
                  <span className="text-[13px] text-muted">Recurring annual value</span>
                  <span className="tnum text-[17px] font-semibold text-frost">
                    {money(data.contracts.recurringValue, { cents: false })}
                  </span>
                </div>
                <Link href="/dashboard/admin/contracts" className="btn-ghost btn-sm mt-4 w-full">
                  Manage renewals
                </Link>
              </div>

              <div className="rounded-card border border-line bg-surface p-5">
                <h2 className="text-[15px] font-semibold">Recently completed</h2>
                <ul className="mt-4 divide-y divide-line">
                  {data.recentJobs.map((job: Job) => (
                    <li key={job._id} className="flex items-center gap-3 py-2.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-sunken text-ok">
                        <IconWrench className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{job.title}</p>
                        <p className="tnum text-2xs text-muted">
                          {job.jobNumber} · {relative(job.completedAt)}
                        </p>
                      </div>
                      <span className="shrink-0 text-2xs text-muted">
                        {typeof job.technician === 'object' ? (job.technician as User).name : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* request funnel */}
          <div className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-[15px] font-semibold">Service request funnel</h2>
            <p className="mt-0.5 text-[12.5px] text-muted">
              Where every request that has ever come in currently sits.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-4 xl:grid-cols-8">
              {[
                'submitted',
                'reviewing',
                'quoted',
                'approved',
                'scheduled',
                'in_progress',
                'completed',
                'cancelled',
              ].map((status) => (
                <div key={status} className="rounded-xl border border-line bg-sunken p-4">
                  <Pill tone={toneFor('request', status)}>{titleCase(status)}</Pill>
                  <p className="tnum mt-3 text-[22px] font-semibold leading-none">
                    {data.requests.byStatus[status] ?? 0}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-2xs text-faint">
              {data.requests.total} requests logged in total · {data.requests.open} still open ·
              generated {fmtDate(new Date())}
            </p>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
