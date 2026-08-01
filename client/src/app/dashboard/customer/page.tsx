'use client';

import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StatTile } from '@/components/charts';
import {
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconClipboard,
  IconClock,
  IconDoc,
  IconMapPin,
  IconPhone,
  IconReceipt,
  IconShield,
  IconTruck,
  IconUser,
  SERVICE_ICONS,
} from '@/components/icons';
import { Avatar, EmptyState, LinkButton, Meter, Pill, Skeleton } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import {
  addressLine,
  fmtDate,
  fmtDateTime,
  money,
  relative,
  serviceLabel,
  titleCase,
  toneFor,
} from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { CustomerSummary, Invoice, Quotation, ServiceRequest } from '@/lib/types';

export default function CustomerOverviewPage() {
  const { user } = useAuth();
  const { data: summary, loading } = useApi<CustomerSummary>('/analytics/customer');
  const { data: requests } = useApi<ServiceRequest[]>('/service-requests', { limit: 5 });
  const { data: quotations } = useApi<Quotation[]>('/quotations', { status: 'sent' });
  const { data: invoices } = useApi<Invoice[]>('/invoices', { limit: 5 });

  const upcoming = summary?.upcomingJob;
  const tech = upcoming?.technician as { name: string; phone?: string; avatarUrl?: string } | undefined;
  const pendingQuotes = quotations ?? [];

  return (
    <DashboardShell
      roles={['customer']}
      title={`Good to see you, ${user?.name?.split(' ')[0] ?? ''}`}
      subtitle="Everything about your systems, in one place"
      actions={
        <LinkButton href="/request-quote" size="sm" icon={<IconArrowRight className="h-3.5 w-3.5" />}>
          New request
        </LinkButton>
      }
    >
      <div className="space-y-5">
        {/* action needed */}
        {pendingQuotes.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-warn/35 bg-warn/[0.06] px-5 py-4">
            <div className="flex items-start gap-3">
              <IconDoc className="mt-0.5 h-4.5 w-4.5 shrink-0 text-warn" />
              <div>
                <p className="text-[14px] font-semibold">
                  {pendingQuotes.length} quotation{pendingQuotes.length > 1 ? 's' : ''} awaiting your
                  decision
                </p>
                <p className="mt-0.5 text-[13px] text-muted">
                  Nothing is scheduled until you approve. Review the line items and decide online.
                </p>
              </div>
            </div>
            <LinkButton href="/dashboard/customer/quotations" size="sm" variant="ghost">
              Review now
            </LinkButton>
          </div>
        )}

        {/* stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[8.5rem]" />)
          ) : (
            <>
              <StatTile
                label="Open requests"
                value={summary?.openRequests ?? 0}
                icon={<IconClipboard className="h-4 w-4" />}
                hint="Not yet completed"
                href="/dashboard/customer/requests"
              />
              <StatTile
                label="Completed visits"
                value={summary?.completedJobs ?? 0}
                icon={<IconCheck className="h-4 w-4" />}
                tone="ok"
                hint="Lifetime with ArcticAir"
              />
              <StatTile
                label="Balance due"
                value={money(summary?.balanceDue ?? 0, { cents: false })}
                icon={<IconReceipt className="h-4 w-4" />}
                tone={summary?.balanceDue ? 'ember' : 'ok'}
                hint={`${summary?.dueInvoiceCount ?? 0} open invoice(s)`}
                href="/dashboard/customer/invoices"
              />
              <StatTile
                label="Maintenance plan"
                value={summary?.contract ? summary.contract.planName.split(' ')[0] : 'None'}
                icon={<IconShield className="h-4 w-4" />}
                tone={summary?.contract ? 'frost' : 'muted' as 'frost'}
                hint={
                  summary?.contract
                    ? `Renews ${fmtDate(summary.contract.endDate)}`
                    : 'Not enrolled yet'
                }
                href="/dashboard/customer/contracts"
              />
            </>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {/* next visit */}
          <div className="rounded-card border border-line bg-surface p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold">Your next visit</h2>
              <Link
                href="/dashboard/customer/requests"
                className="text-2xs uppercase tracking-[0.12em] text-frost hover:opacity-80"
              >
                All requests
              </Link>
            </div>

            {!upcoming ? (
              <EmptyState
                icon={<IconCalendar className="h-5 w-5" />}
                title="Nothing scheduled"
                action={
                  <LinkButton href="/request-quote" size="sm" variant="ghost">
                    Book a service
                  </LinkButton>
                }
              >
                When a technician is assigned you will see their name, certifications and arrival
                window here.
              </EmptyState>
            ) : (
              <div className="rounded-xl border border-frost/25 bg-frost/[0.04] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="tnum text-[13px] font-semibold text-frost">
                        {upcoming.jobNumber}
                      </span>
                      <Pill tone={toneFor('job', upcoming.status)}>{titleCase(upcoming.status)}</Pill>
                    </div>
                    <h3 className="mt-2.5 text-[17px] font-semibold leading-snug">{upcoming.title}</h3>
                    <p className="mt-1 text-[13px] text-muted">{serviceLabel(upcoming.serviceType)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xs uppercase tracking-[0.12em] text-faint">Scheduled</p>
                    <p className="tnum mt-1 text-[14px] font-semibold">
                      {fmtDateTime(upcoming.scheduledStart)}
                    </p>
                    <p className="mt-0.5 text-2xs text-muted">{relative(upcoming.scheduledStart)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5">
                    <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
                    <p className="text-[13px] leading-snug text-muted">
                      {addressLine(upcoming.address)}
                    </p>
                  </div>

                  {tech ? (
                    <div className="flex items-center gap-3">
                      <Avatar name={tech.name} src={tech.avatarUrl} size={36} />
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-medium">{tech.name}</p>
                        <p className="text-2xs text-muted">Assigned technician</p>
                      </div>
                      {tech.phone && (
                        <a
                          href={`tel:${tech.phone.replace(/\D/g, '')}`}
                          className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-frost transition-colors hover:bg-raised"
                          aria-label={`Call ${tech.name}`}
                        >
                          <IconPhone className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="flex items-center gap-2.5 text-[13px] text-muted">
                      <IconTruck className="h-4 w-4 text-faint" />
                      Technician not yet assigned
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* recent requests */}
            <div className="mt-6">
              <p className="mb-3 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
                Recent activity
              </p>
              {!requests?.length ? (
                <p className="py-6 text-center text-[13px] text-muted">No requests raised yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {requests.slice(0, 5).map((r) => {
                    const Icon = SERVICE_ICONS[r.serviceType] ?? IconClipboard;
                    return (
                      <li key={r._id}>
                        <Link
                          href={`/dashboard/customer/requests/${r._id}`}
                          className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-raised"
                        >
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-sunken text-frost">
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13.5px] font-medium">{r.title}</span>
                            <span className="tnum block text-2xs text-muted">
                              {r.trackingCode} · {relative(r.createdAt)}
                            </span>
                          </span>
                          <Pill tone={toneFor('request', r.status)}>{titleCase(r.status)}</Pill>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* right rail */}
          <div className="space-y-5">
            {/* contract */}
            <div className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-[15px] font-semibold">Maintenance plan</h2>
              {summary?.contract ? (
                <>
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <p className="text-[17px] font-semibold text-frost">
                      {summary.contract.planName}
                    </p>
                    <Pill tone={toneFor('contract', summary.contract.status)}>
                      {titleCase(summary.contract.status)}
                    </Pill>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-baseline justify-between text-2xs">
                      <span className="uppercase tracking-[0.12em] text-faint">Visits used</span>
                      <span className="tnum font-semibold">
                        {summary.contract.visitsUsed} / {summary.contract.visitsTotal}
                      </span>
                    </div>
                    <Meter
                      value={summary.contract.visitsUsed}
                      max={summary.contract.visitsTotal}
                    />
                  </div>

                  <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-[13px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Contract</dt>
                      <dd className="tnum font-medium">{summary.contract.contractNumber}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Renews</dt>
                      <dd className="font-medium">{fmtDate(summary.contract.endDate)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Auto-renew</dt>
                      <dd className={summary.contract.autoRenew ? 'text-ok' : 'text-muted'}>
                        {summary.contract.autoRenew ? 'On' : 'Off'}
                      </dd>
                    </div>
                  </dl>

                  <LinkButton
                    href="/dashboard/customer/contracts"
                    size="sm"
                    variant="ghost"
                    className="mt-5 w-full"
                  >
                    Manage plan
                  </LinkButton>
                </>
              ) : (
                <EmptyState
                  icon={<IconShield className="h-5 w-5" />}
                  title="No active plan"
                  action={
                    <LinkButton href="/dashboard/customer/contracts" size="sm">
                      Compare plans
                    </LinkButton>
                  }
                >
                  Two tune-ups a year plus a standing repair discount — usually cheaper than one
                  emergency call.
                </EmptyState>
              )}
            </div>

            {/* invoices */}
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold">Recent invoices</h2>
                <Link
                  href="/dashboard/customer/invoices"
                  className="text-2xs uppercase tracking-[0.12em] text-frost hover:opacity-80"
                >
                  All
                </Link>
              </div>

              {!invoices?.length ? (
                <p className="py-6 text-center text-[13px] text-muted">No invoices yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {invoices.slice(0, 4).map((inv) => (
                    <li key={inv._id}>
                      <Link
                        href={`/dashboard/customer/invoices/${inv._id}`}
                        className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-raised"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="tnum block text-[13px] font-medium">
                            {inv.invoiceNumber}
                          </span>
                          <span className="block text-2xs text-muted">
                            Due {fmtDate(inv.dueDate)}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="tnum block text-[13.5px] font-semibold">
                            {money(inv.total)}
                          </span>
                          <Pill tone={toneFor('invoice', inv.status)}>{titleCase(inv.status)}</Pill>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* profile shortcut */}
            <Link
              href="/dashboard/customer/profile"
              className="flex items-center gap-3 rounded-card border border-line bg-surface p-5 transition-colors hover:border-frost/30"
            >
              <Avatar name={user?.name} src={user?.avatarUrl} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">{user?.name}</p>
                <p className="truncate text-2xs text-muted">
                  {user?.customer?.address ? addressLine(user.customer.address) : user?.email}
                </p>
              </div>
              <IconUser className="h-4 w-4 shrink-0 text-faint" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
