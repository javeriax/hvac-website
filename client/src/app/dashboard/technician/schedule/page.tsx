'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { IconCalendar, IconMapPin, IconUser } from '@/components/icons';
import { ServiceMark } from '@/components/ServiceMark';
import { EmptyState, Pill, Skeleton } from '@/components/ui';
import { addressLine, cx, fmtTime, isToday, serviceLabel, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Job, User } from '@/lib/types';

/** Groups jobs into day buckets keyed by ISO date. */
function groupByDay(jobs: Job[]) {
  const map = new Map<string, Job[]>();
  jobs.forEach((j) => {
    const key = new Date(j.scheduledStart).toDateString();
    map.set(key, [...(map.get(key) ?? []), j]);
  });
  return [...map.entries()]
    .sort((a, b) => +new Date(a[0]) - +new Date(b[0]))
    .map(([day, list]) => ({
      day,
      jobs: list.sort((a, b) => +new Date(a.scheduledStart) - +new Date(b.scheduledStart)),
    }));
}

export default function TechnicianSchedulePage() {
  const { data, loading } = useApi<Job[]>('/jobs');

  const days = useMemo(() => {
    const open = (data ?? []).filter(
      (j) => !['completed', 'cancelled'].includes(j.status),
    );
    return groupByDay(open);
  }, [data]);

  return (
    <DashboardShell
      roles={['technician']}
      title="My schedule"
      subtitle="Every job assigned to you, day by day"
    >
      {loading && <Skeleton className="h-96" />}

      {!loading && days.length === 0 && (
        <div className="rounded-card border border-line bg-surface">
          <EmptyState icon={<IconCalendar className="h-5 w-5" />} title="Your schedule is clear">
            New assignments appear here as soon as dispatch books them.
          </EmptyState>
        </div>
      )}

      <div className="space-y-6">
        {days.map(({ day, jobs }) => {
          const date = new Date(day);
          const todayFlag = isToday(date);

          return (
            <section key={day}>
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={cx(
                    'flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border',
                    todayFlag ? 'border-frost/40 bg-frost/[0.08] text-frost' : 'border-line bg-surface',
                  )}
                >
                  <span className="text-2xs uppercase tracking-[0.1em] text-faint">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="tnum text-[15px] font-semibold leading-none">{date.getDate()}</span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold">
                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                    {todayFlag && <span className="ml-2 text-2xs uppercase tracking-[0.12em] text-frost">Today</span>}
                  </p>
                  <p className="text-2xs text-muted">
                    {jobs.length} job{jobs.length === 1 ? '' : 's'} scheduled
                  </p>
                </div>
                <span className="ml-2 h-px flex-1 bg-line" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => {
                  const customer = job.customer as User;
                  return (
                    <Link
                      key={job._id}
                      href={`/dashboard/technician/jobs/${job._id}`}
                      className="group rounded-card border border-line bg-surface p-4 transition-colors hover:border-frost/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <ServiceMark type={job.serviceType} size={36} />
                        <span className="tnum text-[13px] font-semibold">
                          {fmtTime(job.scheduledStart)}
                        </span>
                      </div>

                      <p className="mt-3 truncate text-[13.5px] font-medium">{job.title}</p>
                      <p className="tnum text-2xs text-muted">
                        {job.jobNumber} · {serviceLabel(job.serviceType)}
                      </p>

                      <div className="mt-3 space-y-1.5 border-t border-line pt-3">
                        <p className="flex items-start gap-2 text-2xs text-muted">
                          <IconMapPin className="mt-0.5 h-3 w-3 shrink-0 text-faint" />
                          <span className="truncate">{addressLine(job.address)}</span>
                        </p>
                        <p className="flex items-center gap-2 text-2xs text-muted">
                          <IconUser className="h-3 w-3 shrink-0 text-faint" />
                          <span className="truncate">{customer?.name}</span>
                        </p>
                      </div>

                      <div className="mt-3">
                        <Pill tone={toneFor('job', job.status)}>{titleCase(job.status)}</Pill>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </DashboardShell>
  );
}
