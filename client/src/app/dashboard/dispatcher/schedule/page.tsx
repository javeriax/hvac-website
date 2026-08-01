'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AssignTechnicianModal } from '@/components/dashboard/AssignTechnicianModal';
import { IconArrowLeft, IconArrowRight, IconCalendar, IconRefresh } from '@/components/icons';
import { Button, Pill, Skeleton } from '@/components/ui';
import { cx, fmtTime, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Job, User } from '@/lib/types';

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

export default function DispatcherSchedulePage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [assigning, setAssigning] = useState<Job | null>(null);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    return d;
  }, [weekStart]);

  const { data, loading, reload } = useApi<Job[]>('/jobs', {
    from: weekStart.toISOString(),
    to: weekEnd.toISOString(),
  });

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const jobs = (data ?? [])
        .filter((j) => new Date(j.scheduledStart).toDateString() === day.toDateString())
        .sort((a, b) => +new Date(a.scheduledStart) - +new Date(b.scheduledStart));
      return { day, jobs };
    });
  }, [data, weekStart]);

  const shiftWeek = (delta: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  };

  const total = data?.length ?? 0;

  return (
    <DashboardShell
      roles={['dispatcher', 'admin']}
      title="Work calendar"
      subtitle={`${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(
        weekEnd.getTime() - 86400000,
      ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${total} job(s)`}
      actions={
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => shiftWeek(-1)} aria-label="Previous week">
            <IconArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            <IconRefresh className="h-3.5 w-3.5" />
            This week
          </Button>
          <Button variant="ghost" size="sm" onClick={() => shiftWeek(1)} aria-label="Next week">
            <IconArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      }
    >
      {loading ? (
        <Skeleton className="h-[32rem]" />
      ) : (
        <div className="scroll-x">
          <div className="grid min-w-[64rem] grid-cols-7 gap-px overflow-hidden rounded-card border border-line bg-line">
            {days.map(({ day, jobs }) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <div
                  key={day.toISOString()}
                  className={cx('min-h-[26rem] bg-surface p-3', isPast && 'opacity-70')}
                >
                  <div className="mb-3 flex items-baseline justify-between gap-2">
                    <div>
                      <p className="text-2xs uppercase tracking-[0.12em] text-faint">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p
                        className={cx(
                          'tnum text-[17px] font-semibold leading-none',
                          isToday && 'text-frost',
                        )}
                      >
                        {day.getDate()}
                      </p>
                    </div>
                    {jobs.length > 0 && (
                      <span className="tnum rounded bg-raised px-1.5 py-0.5 text-2xs text-muted">
                        {jobs.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {jobs.length === 0 && (
                      <p className="pt-6 text-center text-2xs text-faint">—</p>
                    )}

                    {jobs.map((job) => {
                      const tech = job.technician as User | undefined;
                      const unassigned = job.status === 'unassigned';

                      return (
                        <div
                          key={job._id}
                          className={cx(
                            'rounded-lg border p-2.5 transition-colors',
                            unassigned
                              ? 'border-danger/30 bg-danger/[0.05]'
                              : job.priority === 'emergency'
                                ? 'border-ember/30 bg-ember/[0.05]'
                                : 'border-line bg-sunken hover:border-frost/30',
                          )}
                        >
                          <p className="tnum text-2xs font-semibold text-muted">
                            {fmtTime(job.scheduledStart)}
                          </p>
                          <Link
                            href={`/dashboard/technician/jobs/${job._id}`}
                            className="mt-1 block truncate text-[12.5px] font-medium hover:text-frost"
                          >
                            {job.title}
                          </Link>
                          <p className="mt-1 truncate text-2xs text-muted">
                            {tech?.name ?? 'Unassigned'}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between gap-1">
                            <Pill tone={toneFor('job', job.status)}>{titleCase(job.status)}</Pill>
                          </div>
                          {unassigned && (
                            <Button
                              size="xs"
                              variant="ghost"
                              className="mt-2 w-full"
                              onClick={() => setAssigning(job)}
                            >
                              Assign
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && total === 0 && (
        <p className="mt-6 flex items-center justify-center gap-2 text-[13px] text-muted">
          <IconCalendar className="h-4 w-4" />
          No jobs booked in this week.
        </p>
      )}

      <AssignTechnicianModal
        job={assigning}
        open={assigning !== null}
        onClose={() => setAssigning(null)}
        onDone={reload}
      />
    </DashboardShell>
  );
}
