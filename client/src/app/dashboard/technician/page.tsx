'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StatTile } from '@/components/charts';
import { TechStatusToggle } from '@/components/dashboard/TechStatusToggle';
import {
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconClock,
  IconMapPin,
  IconPhone,
  IconStar,
  IconTruck,
  IconUser,
  SERVICE_ICONS,
} from '@/components/icons';
import { EmptyState, Pill, Skeleton } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import {
  addressLine,
  cx,
  fmtDate,
  fmtTime,
  isToday,
  relative,
  serviceLabel,
  titleCase,
  toneFor,
} from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Job, TechnicianSummary, User } from '@/lib/types';

export default function TechnicianTodayPage() {
  const { user } = useAuth();
  const { data: summary, loading } = useApi<TechnicianSummary>('/analytics/technician');
  const { data: jobs, loading: jobsLoading } = useApi<Job[]>('/jobs');

  const { today, upcoming } = useMemo(() => {
    const open = (jobs ?? []).filter((j) => !['completed', 'cancelled'].includes(j.status));
    return {
      today: open.filter((j) => isToday(j.scheduledStart)),
      upcoming: open
        .filter((j) => !isToday(j.scheduledStart) && new Date(j.scheduledStart) > new Date())
        .slice(0, 5),
    };
  }, [jobs]);

  return (
    <DashboardShell
      roles={['technician']}
      title={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      subtitle={`${today.length} job${today.length === 1 ? '' : 's'} on your route today`}
      actions={<TechStatusToggle />}
    >
      <div className="space-y-5">
        {/* stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[8.5rem]" />)
          ) : (
            <>
              <StatTile
                label="Jobs today"
                value={summary?.todayJobs ?? 0}
                icon={<IconCalendar className="h-4 w-4" />}
                hint={`${summary?.completedToday ?? 0} completed so far`}
              />
              <StatTile
                label="Open assignments"
                value={summary?.open ?? 0}
                icon={<IconTruck className="h-4 w-4" />}
                tone="warn"
                hint="Across all dates"
              />
              <StatTile
                label="Completed this week"
                value={summary?.completedWeek ?? 0}
                icon={<IconCheck className="h-4 w-4" />}
                tone="ok"
                hint={`${summary?.hoursThisWeek ?? 0}h on site`}
              />
              <StatTile
                label="Rating"
                value={(summary?.rating ?? 5).toFixed(1)}
                icon={<IconStar className="h-4 w-4" />}
                tone="ember"
                hint={`${summary?.lifetimeJobs ?? 0} lifetime jobs`}
              />
            </>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          {/* today's route */}
          <div className="rounded-card border border-line bg-surface p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold">Today&apos;s route</h2>
              <Link
                href="/dashboard/technician/schedule"
                className="text-2xs uppercase tracking-[0.12em] text-frost hover:opacity-80"
              >
                Full schedule
              </Link>
            </div>

            {jobsLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : !today.length ? (
              <EmptyState icon={<IconCalendar className="h-5 w-5" />} title="Nothing on the board today">
                Enjoy it. Your dispatcher will notify you if an emergency comes in.
              </EmptyState>
            ) : (
              /* timeline rail — each job pinned to its start time */
              <ol className="relative space-y-3 border-l border-line pl-8">
                {today
                  .slice()
                  .sort((a, b) => +new Date(a.scheduledStart) - +new Date(b.scheduledStart))
                  .map((job) => {
                    const Icon = SERVICE_ICONS[job.serviceType] ?? IconTruck;
                    const customer = job.customer as User;
                    const live = ['en_route', 'in_progress'].includes(job.status);
                    const urgent = job.priority === 'emergency';

                    return (
                      <li key={job._id} className="relative">
                        <span className="absolute -left-[2.35rem] top-4 flex flex-col items-center">
                          <span className="tnum mb-1 whitespace-nowrap text-2xs font-semibold text-muted">
                            {fmtTime(job.scheduledStart)}
                          </span>
                        </span>
                        <span
                          className={cx(
                            'absolute -left-[2.05rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 bg-surface',
                            live ? 'border-ember' : urgent ? 'border-danger' : 'border-frost',
                          )}
                        />

                        <Link
                          href={`/dashboard/technician/jobs/${job._id}`}
                          className={cx(
                            'block rounded-xl border p-4 transition-colors',
                            live
                              ? 'border-ember/35 bg-ember/[0.05]'
                              : urgent
                                ? 'border-danger/30 bg-danger/[0.04]'
                                : 'border-line bg-sunken hover:border-frost/30',
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <span
                                className={cx(
                                  'grid h-9 w-9 shrink-0 place-items-center rounded-lg border',
                                  urgent
                                    ? 'border-danger/30 bg-danger/10 text-danger'
                                    : 'border-frost/25 bg-frost/[0.08] text-frost',
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-[14px] font-semibold">{job.title}</p>
                                <p className="tnum mt-0.5 text-2xs text-muted">
                                  {job.jobNumber} · {serviceLabel(job.serviceType)}
                                </p>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              <Pill tone={toneFor('job', job.status)}>{titleCase(job.status)}</Pill>
                              {urgent && <Pill tone="danger">SOS</Pill>}
                            </div>
                          </div>

                          <div className="mt-3.5 grid gap-2 border-t border-line pt-3 sm:grid-cols-2">
                            <p className="flex items-start gap-2 text-[12.5px] text-muted">
                              <IconMapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
                              <span className="truncate">{addressLine(job.address)}</span>
                            </p>
                            <p className="flex items-center gap-2 text-[12.5px] text-muted">
                              <IconUser className="h-3.5 w-3.5 shrink-0 text-faint" />
                              <span className="truncate">{customer?.name ?? '—'}</span>
                              {customer?.phone && (
                                <a
                                  href={`tel:${customer.phone.replace(/\D/g, '')}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="ml-auto text-frost hover:opacity-80"
                                  aria-label={`Call ${customer.name}`}
                                >
                                  <IconPhone className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
              </ol>
            )}
          </div>

          {/* right rail */}
          <div className="space-y-5">
            <div className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-[15px] font-semibold">Coming up</h2>
              {!upcoming.length ? (
                <p className="py-8 text-center text-[13px] text-muted">Nothing scheduled beyond today.</p>
              ) : (
                <ul className="mt-4 divide-y divide-line">
                  {upcoming.map((job) => (
                    <li key={job._id}>
                      <Link
                        href={`/dashboard/technician/jobs/${job._id}`}
                        className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-raised"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-medium">{job.title}</p>
                          <p className="text-2xs text-muted">
                            {fmtDate(job.scheduledStart)} · {fmtTime(job.scheduledStart)}
                          </p>
                        </div>
                        <IconArrowRight className="h-3.5 w-3.5 shrink-0 text-faint" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* profile card */}
            <div className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-[15px] font-semibold">Your certifications</h2>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(user?.technician?.certifications ?? []).map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-frost/20 bg-frost/[0.06] px-2 py-1 text-2xs text-frost"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <h3 className="mt-5 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
                Skills
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(user?.technician?.skills ?? []).map((s) => (
                  <span key={s} className="rounded-md bg-raised px-2 py-1 text-2xs text-muted">
                    {s}
                  </span>
                ))}
              </div>

              <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[13px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Employee ID</dt>
                  <dd className="tnum font-medium">{user?.technician?.employeeId ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Shift</dt>
                  <dd className="tnum font-medium">
                    {user?.technician?.shiftStart} – {user?.technician?.shiftEnd}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Service areas</dt>
                  <dd className="max-w-[60%] text-right font-medium">
                    {(user?.technician?.serviceAreas ?? []).join(', ') || '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
