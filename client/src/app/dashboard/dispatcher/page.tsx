'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AssignTechnicianModal } from '@/components/dashboard/AssignTechnicianModal';
import { StatTile } from '@/components/charts';
import {
  IconAlert,
  IconArrowRight,
  IconCalendar,
  IconClock,
  IconFlame,
  IconMapPin,
  IconTruck,
  IconUser,
  IconUsers,
  SERVICE_ICONS,
} from '@/components/icons';
import { Avatar, Button, Dot, EmptyState, Pill, Skeleton } from '@/components/ui';
import { addressLine, cx, fmtTime, serviceLabel, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { DispatchSummary, Job, ServiceRequest, User } from '@/lib/types';

/** 7am → 7pm working window used by the timeline rail. */
const DAY_START = 7;
const DAY_END = 19;

export default function DispatcherBoardPage() {
  const today = new Date().toISOString();
  const { data: summary, loading: summaryLoading } = useApi<DispatchSummary>('/analytics/dispatch');
  const { data: jobs, loading, reload } = useApi<Job[]>('/jobs', { date: today });
  const { data: unassigned, reload: reloadUnassigned } = useApi<Job[]>('/jobs', {
    status: 'unassigned',
  });
  const { data: technicians } = useApi<User[]>('/users/technicians');
  const { data: requests } = useApi<ServiceRequest[]>('/service-requests', { priority: 'emergency' });

  const [assigning, setAssigning] = useState<Job | null>(null);

  const emergencies = useMemo(
    () => (requests ?? []).filter((r) => !['completed', 'cancelled'].includes(r.status)),
    [requests],
  );

  // Group today's jobs by technician for the timeline rail.
  const lanes = useMemo(() => {
    const byTech = new Map<string, Job[]>();
    (jobs ?? []).forEach((j) => {
      const id = typeof j.technician === 'object' ? (j.technician as User)._id : String(j.technician ?? 'unassigned');
      byTech.set(id, [...(byTech.get(id) ?? []), j]);
    });
    return (technicians ?? [])
      .map((t) => ({ tech: t, jobs: byTech.get(t._id) ?? [] }))
      .sort((a, b) => b.jobs.length - a.jobs.length);
  }, [jobs, technicians]);

  const refreshAll = () => {
    void reload();
    void reloadUnassigned();
  };

  return (
    <DashboardShell
      roles={['dispatcher', 'admin']}
      title="Dispatch board"
      subtitle={new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}
      actions={
        <Link href="/dashboard/dispatcher/schedule" className="btn-ghost btn-sm">
          <IconCalendar className="h-3.5 w-3.5" />
          Calendar
        </Link>
      }
    >
      <div className="space-y-5">
        {/* stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[8.5rem]" />)
          ) : (
            <>
              <StatTile
                label="Jobs today"
                value={summary?.todayJobs ?? 0}
                icon={<IconCalendar className="h-4 w-4" />}
                hint="Across all technicians"
              />
              <StatTile
                label="Unassigned"
                value={summary?.unassigned ?? 0}
                icon={<IconAlert className="h-4 w-4" />}
                tone={summary?.unassigned ? 'danger' : 'ok'}
                hint="Need a technician now"
              />
              <StatTile
                label="Open emergencies"
                value={summary?.emergencies ?? 0}
                icon={<IconFlame className="h-4 w-4" />}
                tone={summary?.emergencies ? 'ember' : 'ok'}
                hint="Priority queue"
              />
              <StatTile
                label="Available techs"
                value={summary?.technicianStatus?.available ?? 0}
                icon={<IconUsers className="h-4 w-4" />}
                tone="frost"
                hint={`${summary?.technicianStatus?.on_job ?? 0} on a job · ${summary?.technicianStatus?.off_duty ?? 0} off duty`}
              />
            </>
          )}
        </div>

        {/* emergency queue */}
        {emergencies.length > 0 && (
          <div className="rounded-card border border-ember/35 bg-ember/[0.05] p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ember">
              <IconFlame className="h-4 w-4" />
              Emergency queue ({emergencies.length})
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {emergencies.map((r) => (
                <Link
                  key={r._id}
                  href={`/dashboard/dispatcher/requests/${r._id}`}
                  className="rounded-xl border border-ember/25 bg-surface p-4 transition-colors hover:border-ember/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[13.5px] font-semibold">{r.title}</p>
                    <Pill tone={toneFor('request', r.status)}>{titleCase(r.status)}</Pill>
                  </div>
                  <p className="tnum mt-1 text-2xs text-muted">{r.trackingCode}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-2xs text-muted">
                    <IconMapPin className="h-3 w-3 text-faint" />
                    {r.address.city} · {r.contact.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* unassigned queue */}
        <div className="rounded-card border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold">Awaiting assignment</h2>
            <span className="tnum text-2xs text-muted">{unassigned?.length ?? 0} job(s)</span>
          </div>

          {!unassigned?.length ? (
            <EmptyState icon={<IconTruck className="h-5 w-5" />} title="Every job has a technician">
              Nothing is sitting unassigned. Nice board.
            </EmptyState>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {unassigned.map((job) => {
                const Icon = SERVICE_ICONS[job.serviceType] ?? IconTruck;
                const customer = job.customer as User;
                return (
                  <div
                    key={job._id}
                    className="rounded-xl border border-danger/25 bg-danger/[0.03] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-danger/25 bg-danger/10 text-danger">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold">{job.title}</p>
                        <p className="tnum text-2xs text-muted">
                          {job.jobNumber} · {serviceLabel(job.serviceType)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-2xs text-muted">
                      <p className="flex items-center gap-1.5">
                        <IconClock className="h-3 w-3 text-faint" />
                        {fmtTime(job.scheduledStart)}
                      </p>
                      <p className="flex items-start gap-1.5">
                        <IconMapPin className="mt-0.5 h-3 w-3 shrink-0 text-faint" />
                        <span className="truncate">{addressLine(job.address)}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <IconUser className="h-3 w-3 text-faint" />
                        <span className="truncate">{customer?.name}</span>
                      </p>
                    </div>

                    <Button size="sm" className="mt-3 w-full" onClick={() => setAssigning(job)}>
                      Assign technician
                      <IconArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* technician timeline */}
        <div className="rounded-card border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold">Today&apos;s technician lanes</h2>
            <Link
              href="/dashboard/dispatcher/technicians"
              className="text-2xs uppercase tracking-[0.12em] text-frost hover:opacity-80"
            >
              Roster
            </Link>
          </div>

          {loading ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : (
            <div className="scroll-x mt-5">
              <div className="min-w-[46rem]">
                {/* hour ruler */}
                <div className="relative mb-2 ml-44 h-5">
                  {Array.from({ length: DAY_END - DAY_START + 1 }).map((_, i) => (
                    <span
                      key={i}
                      className="absolute font-mono text-[9px] text-faint"
                      style={{ left: `${(i / (DAY_END - DAY_START)) * 100}%`, transform: 'translateX(-50%)' }}
                    >
                      {DAY_START + i}:00
                    </span>
                  ))}
                </div>

                <div className="space-y-2">
                  {lanes.map(({ tech, jobs: laneJobs }) => (
                    <div key={tech._id} className="flex items-center gap-3">
                      <div className="flex w-44 shrink-0 items-center gap-2.5">
                        <Avatar name={tech.name} src={tech.avatarUrl} size={30} />
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-medium">{tech.name}</p>
                          <p className="flex items-center gap-1.5 text-2xs text-muted">
                            <Dot tone={toneFor('tech', tech.technician?.status)} />
                            {titleCase(tech.technician?.status)}
                          </p>
                        </div>
                      </div>

                      <div className="relative h-11 flex-1 rounded-lg border border-line bg-sunken">
                        {/* hour gridlines */}
                        {Array.from({ length: DAY_END - DAY_START }).map((_, i) => (
                          <span
                            key={i}
                            className="absolute inset-y-0 w-px bg-line/60"
                            style={{ left: `${((i + 1) / (DAY_END - DAY_START)) * 100}%` }}
                          />
                        ))}

                        {laneJobs.map((job) => {
                          const s = new Date(job.scheduledStart);
                          const e = new Date(job.scheduledEnd);
                          const startH = s.getHours() + s.getMinutes() / 60;
                          const endH = e.getHours() + e.getMinutes() / 60;
                          const left = ((startH - DAY_START) / (DAY_END - DAY_START)) * 100;
                          const width = ((endH - startH) / (DAY_END - DAY_START)) * 100;
                          const live = ['en_route', 'in_progress'].includes(job.status);

                          return (
                            <Link
                              key={job._id}
                              href={`/dashboard/technician/jobs/${job._id}`}
                              title={`${job.jobNumber} · ${job.title} · ${fmtTime(job.scheduledStart)}`}
                              className={cx(
                                'absolute inset-y-1 flex items-center overflow-hidden rounded-md border px-2 text-2xs font-medium transition-transform hover:z-10 hover:scale-[1.02]',
                                job.priority === 'emergency'
                                  ? 'border-danger/40 bg-danger/20 text-danger'
                                  : live
                                    ? 'border-ember/40 bg-ember/20 text-ember'
                                    : job.status === 'completed'
                                      ? 'border-ok/30 bg-ok/12 text-ok'
                                      : 'border-frost/35 bg-frost/15 text-frost',
                              )}
                              style={{
                                left: `${Math.max(0, left)}%`,
                                width: `${Math.max(4, Math.min(width, 100 - left))}%`,
                              }}
                            >
                              <span className="truncate">{job.title}</span>
                            </Link>
                          );
                        })}

                        {laneJobs.length === 0 && (
                          <span className="absolute inset-0 grid place-items-center text-2xs text-faint">
                            No jobs today
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AssignTechnicianModal
        job={assigning}
        open={assigning !== null}
        onClose={() => setAssigning(null)}
        onDone={refreshAll}
      />
    </DashboardShell>
  );
}
