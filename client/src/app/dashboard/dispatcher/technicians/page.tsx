'use client';

import { useMemo } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StatTile } from '@/components/charts';
import {
  IconClock,
  IconMapPin,
  IconPhone,
  IconStar,
  IconTruck,
  IconUsers,
} from '@/components/icons';
import { Avatar, Dot, Meter, Skeleton } from '@/components/ui';
import { cx, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { User } from '@/lib/types';

export default function DispatcherTechniciansPage() {
  const { data, loading } = useApi<User[]>('/users/technicians');

  const stats = useMemo(() => {
    const rows = data ?? [];
    return {
      total: rows.length,
      available: rows.filter((t) => t.technician?.status === 'available').length,
      onJob: rows.filter((t) => t.technician?.status === 'on_job').length,
      load: rows.reduce((a, t) => a + (t.jobsToday ?? 0), 0),
    };
  }, [data]);

  return (
    <DashboardShell
      roles={['dispatcher', 'admin']}
      title="Technician roster"
      subtitle="Availability, coverage and today's load"
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="On the roster" value={stats.total} icon={<IconUsers className="h-4 w-4" />} />
          <StatTile
            label="Available now"
            value={stats.available}
            icon={<IconTruck className="h-4 w-4" />}
            tone="ok"
          />
          <StatTile
            label="On a job"
            value={stats.onJob}
            icon={<IconClock className="h-4 w-4" />}
            tone="ember"
          />
          <StatTile
            label="Jobs today"
            value={stats.load}
            icon={<IconTruck className="h-4 w-4" />}
            tone="frost"
            hint="Total across the team"
          />
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(data ?? []).map((tech) => {
              const t = tech.technician;
              const load = tech.jobsToday ?? 0;
              return (
                <div
                  key={tech._id}
                  className={cx(
                    'rounded-card border bg-surface p-5',
                    t?.status === 'available' ? 'border-ok/25' : 'border-line',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={tech.name} src={tech.avatarUrl} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold">{tech.name}</p>
                      <p className="tnum text-2xs text-muted">{t?.employeeId}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-2xs">
                        <Dot tone={toneFor('tech', t?.status)} pulse={t?.status === 'available'} />
                        <span className="text-muted">{titleCase(t?.status)}</span>
                      </p>
                    </div>
                    <span className="tnum flex shrink-0 items-center gap-1 text-[13px] font-semibold text-ember">
                      <IconStar className="h-3.5 w-3.5 fill-current" />
                      {(t?.rating ?? 5).toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-baseline justify-between text-2xs">
                      <span className="uppercase tracking-[0.12em] text-faint">Today&apos;s load</span>
                      <span className="tnum font-semibold">{load} / 6</span>
                    </div>
                    <Meter
                      value={load}
                      max={6}
                      tone={load >= 5 ? 'danger' : load >= 3 ? 'warn' : 'ok'}
                    />
                  </div>

                  <div className="mt-4 space-y-2 border-t border-line pt-3.5 text-2xs text-muted">
                    <p className="flex items-center gap-2">
                      <IconClock className="h-3 w-3 shrink-0 text-faint" />
                      <span className="tnum">
                        {t?.shiftStart} – {t?.shiftEnd}
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <IconMapPin className="mt-0.5 h-3 w-3 shrink-0 text-faint" />
                      <span>{(t?.serviceAreas ?? []).join(', ') || '—'}</span>
                    </p>
                    {tech.phone && (
                      <a
                        href={`tel:${tech.phone.replace(/\D/g, '')}`}
                        className="tnum flex items-center gap-2 text-frost hover:opacity-80"
                      >
                        <IconPhone className="h-3 w-3 shrink-0" />
                        {tech.phone}
                      </a>
                    )}
                  </div>

                  <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-line pt-3.5">
                    {(t?.skills ?? []).map((s) => (
                      <span key={s} className="rounded bg-raised px-1.5 py-0.5 text-2xs text-muted">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
