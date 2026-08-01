'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StatTile } from '@/components/charts';
import {
  IconArrowLeft,
  IconCheck,
  IconClipboard,
  IconMail,
  IconMapPin,
  IconPhone,
  IconReceipt,
  IconShield,
  IconTruck,
} from '@/components/icons';
import { Alert, Avatar, Meter, Pill, Skeleton } from '@/components/ui';
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
import { Invoice, Job, MaintenanceContract, ServiceRequest, User } from '@/lib/types';

interface CustomerRecord {
  user: User;
  requests: ServiceRequest[];
  jobs: Job[];
  invoices: Invoice[];
  contract: MaintenanceContract | null;
  lifetimeValue: number;
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, loading, error } = useApi<CustomerRecord>(`/users/${id}`);

  const customer = data?.user;
  const outstanding = (data?.invoices ?? []).reduce((a, i) => a + i.balance, 0);

  return (
    <DashboardShell
      roles={['admin']}
      title={customer?.name ?? 'Customer'}
      subtitle={customer ? `Customer since ${fmtDate(customer.customer?.customerSince ?? customer.createdAt)}` : undefined}
      actions={
        <button className="btn-ghost btn-sm" onClick={() => router.push('/dashboard/admin/customers')}>
          <IconArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
      }
    >
      {loading && <Skeleton className="h-96" />}
      {error && <Alert tone="danger">{error}</Alert>}

      {data && customer && (
        <div className="space-y-5">
          {/* stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Lifetime value"
              value={money(data.lifetimeValue, { cents: false })}
              icon={<IconReceipt className="h-4 w-4" />}
              tone="ok"
              hint="Paid invoices"
            />
            <StatTile
              label="Outstanding"
              value={money(outstanding, { cents: false })}
              icon={<IconReceipt className="h-4 w-4" />}
              tone={outstanding > 0 ? 'ember' : 'ok'}
              hint={`${data.invoices.length} invoice(s) on record`}
            />
            <StatTile
              label="Completed visits"
              value={data.jobs.filter((j) => j.status === 'completed').length}
              icon={<IconCheck className="h-4 w-4" />}
              hint={`${data.jobs.length} job(s) total`}
            />
            <StatTile
              label="Service requests"
              value={data.requests.length}
              icon={<IconClipboard className="h-4 w-4" />}
              tone="frost"
              hint={`${data.requests.filter((r) => !['completed', 'cancelled'].includes(r.status)).length} still open`}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.65fr_1.35fr]">
            {/* profile */}
            <div className="space-y-4">
              <div className="rounded-card border border-line bg-surface p-5">
                <div className="flex items-center gap-3.5">
                  <Avatar name={customer.name} src={customer.avatarUrl} size={52} />
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-semibold">{customer.name}</p>
                    {customer.customer?.companyName && (
                      <p className="truncate text-[13px] text-muted">{customer.customer.companyName}</p>
                    )}
                    <div className="mt-1.5 flex gap-1.5">
                      <Pill tone={customer.customer?.propertyType === 'commercial' ? 'ember' : 'frost'}>
                        {titleCase(customer.customer?.propertyType ?? 'residential')}
                      </Pill>
                      <Pill tone={customer.isActive ? 'ok' : 'muted'}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </Pill>
                    </div>
                  </div>
                </div>

                <dl className="mt-5 space-y-3 border-t border-line pt-4 text-[13px]">
                  <div className="flex items-start gap-2.5">
                    <IconMail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
                    <dd className="break-all text-muted">{customer.email}</dd>
                  </div>
                  {customer.phone && (
                    <div className="flex items-start gap-2.5">
                      <IconPhone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
                      <dd className="tnum text-muted">{customer.phone}</dd>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5">
                    <IconMapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
                    <dd className="leading-snug text-muted">{addressLine(customer.customer?.address)}</dd>
                  </div>
                </dl>

                <p className="mt-4 border-t border-line pt-3 text-2xs text-faint">
                  Last signed in {customer.lastLoginAt ? relative(customer.lastLoginAt) : 'never'}
                </p>
              </div>

              {/* contract */}
              <div className="rounded-card border border-line bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                    <IconShield className="h-4 w-4 text-frost" />
                    Maintenance plan
                  </h2>
                  {data.contract && (
                    <Pill tone={toneFor('contract', data.contract.status)}>
                      {titleCase(data.contract.status)}
                    </Pill>
                  )}
                </div>

                {data.contract ? (
                  <>
                    <p className="mt-3 text-[15px] font-semibold text-frost">{data.contract.planName}</p>
                    <p className="tnum mt-1 text-2xs text-muted">{data.contract.contractNumber}</p>

                    <div className="mt-4">
                      <div className="mb-1.5 flex items-baseline justify-between text-2xs">
                        <span className="text-faint">Visits used</span>
                        <span className="tnum font-semibold">
                          {data.contract.visitsUsed} / {data.contract.visitsTotal}
                        </span>
                      </div>
                      <Meter value={data.contract.visitsUsed} max={data.contract.visitsTotal} />
                    </div>

                    <dl className="mt-4 space-y-2 border-t border-line pt-3 text-[13px]">
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Renews</dt>
                        <dd className="font-medium">{fmtDate(data.contract.endDate)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Value</dt>
                        <dd className="tnum font-medium">
                          {money(data.contract.amount, { cents: false })}/
                          {data.contract.billingCycle === 'annual' ? 'yr' : 'mo'}
                        </dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <p className="mt-3 text-[13px] leading-relaxed text-muted">
                    Not enrolled in a maintenance plan. A good upsell candidate if their system is
                    past five years old.
                  </p>
                )}
              </div>
            </div>

            {/* activity */}
            <div className="space-y-5">
              <div className="overflow-hidden rounded-card border border-line bg-surface">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="text-[15px] font-semibold">Service requests</h2>
                </div>
                {data.requests.length === 0 ? (
                  <p className="px-5 py-8 text-center text-[13px] text-muted">No requests on record.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {data.requests.slice(0, 8).map((r) => (
                      <li key={r._id}>
                        <Link
                          href={`/dashboard/dispatcher/requests/${r._id}`}
                          className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-raised"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-medium">{r.title}</p>
                            <p className="tnum text-2xs text-muted">
                              {r.trackingCode} · {serviceLabel(r.serviceType)} · {relative(r.createdAt)}
                            </p>
                          </div>
                          <Pill tone={toneFor('request', r.status)}>{titleCase(r.status)}</Pill>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="overflow-hidden rounded-card border border-line bg-surface">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="text-[15px] font-semibold">Visit history</h2>
                </div>
                {data.jobs.length === 0 ? (
                  <p className="px-5 py-8 text-center text-[13px] text-muted">No jobs on record.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {data.jobs.slice(0, 8).map((j) => (
                      <li key={j._id}>
                        <Link
                          href={`/dashboard/technician/jobs/${j._id}`}
                          className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-raised"
                        >
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-sunken text-frost">
                            <IconTruck className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-medium">{j.title}</p>
                            <p className="tnum text-2xs text-muted">
                              {j.jobNumber} · {fmtDateTime(j.scheduledStart)}
                              {typeof j.technician === 'object'
                                ? ` · ${(j.technician as User).name}`
                                : ''}
                            </p>
                          </div>
                          <Pill tone={toneFor('job', j.status)}>{titleCase(j.status)}</Pill>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="overflow-hidden rounded-card border border-line bg-surface">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="text-[15px] font-semibold">Invoices</h2>
                </div>
                {data.invoices.length === 0 ? (
                  <p className="px-5 py-8 text-center text-[13px] text-muted">No invoices on record.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {data.invoices.slice(0, 8).map((inv) => (
                      <li key={inv._id}>
                        <Link
                          href={`/dashboard/admin/invoices/${inv._id}`}
                          className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-raised"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="tnum text-[13.5px] font-medium">{inv.invoiceNumber}</p>
                            <p className="text-2xs text-muted">
                              Issued {fmtDate(inv.issueDate)} · due {fmtDate(inv.dueDate)}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="tnum text-[13.5px] font-semibold">{money(inv.total)}</p>
                            <Pill tone={toneFor('invoice', inv.status)}>{titleCase(inv.status)}</Pill>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
