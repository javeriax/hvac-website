'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DataTable, TablePanel } from '@/components/dashboard/DataTable';
import { IconCheck, IconClock, IconSignature, IconStar } from '@/components/icons';
import { StatTile } from '@/components/charts';
import { Pill } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { fmtDate, relative, serviceLabel, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Job, User } from '@/lib/types';

export default function TechnicianHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading, error } = useApi<Job[]>('/jobs', { status: 'completed' });

  const stats = useMemo(() => {
    const rows = data ?? [];
    const hours = rows.reduce((a, j) => a + (j.report?.laborHours ?? 0), 0);
    return {
      total: rows.length,
      hours: Math.round(hours * 10) / 10,
      signed: rows.filter((j) => j.signature).length,
    };
  }, [data]);

  return (
    <DashboardShell
      roles={['technician']}
      title="Completed work"
      subtitle="Everything you have closed out, with reports and sign-offs"
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Jobs completed"
            value={stats.total}
            icon={<IconCheck className="h-4 w-4" />}
            tone="ok"
            hint="Visible in this list"
          />
          <StatTile
            label="Hours on site"
            value={`${stats.hours}h`}
            icon={<IconClock className="h-4 w-4" />}
            hint="From submitted reports"
          />
          <StatTile
            label="Signed off"
            value={stats.signed}
            icon={<IconSignature className="h-4 w-4" />}
            tone="frost"
            hint="Customer signature captured"
          />
          <StatTile
            label="Lifetime jobs"
            value={user?.technician?.jobsCompleted ?? 0}
            icon={<IconStar className="h-4 w-4" />}
            tone="ember"
            hint={`Rating ${(user?.technician?.rating ?? 5).toFixed(1)}`}
          />
        </div>

        <TablePanel title="Completed jobs">
          <DataTable<Job>
            rows={data}
            loading={loading}
            error={error}
            onRowClick={(row) => router.push(`/dashboard/technician/jobs/${row._id}`)}
            empty={{ icon: <IconCheck className="h-5 w-5" />, title: 'No completed jobs yet' }}
            columns={[
              {
                key: 'job',
                header: 'Job',
                render: (j) => (
                  <div>
                    <p className="truncate text-[13.5px] font-medium">{j.title}</p>
                    <p className="tnum text-2xs text-muted">{j.jobNumber}</p>
                  </div>
                ),
              },
              {
                key: 'customer',
                header: 'Customer',
                className: 'w-44',
                render: (j) => (
                  <span className="text-[13px] text-muted">{(j.customer as User)?.name ?? '—'}</span>
                ),
              },
              {
                key: 'type',
                header: 'Service',
                className: 'w-32',
                render: (j) => <span className="text-[13px] text-muted">{serviceLabel(j.serviceType)}</span>,
              },
              {
                key: 'completed',
                header: 'Completed',
                className: 'w-36',
                render: (j) => (
                  <div>
                    <p className="text-[13px]">{fmtDate(j.completedAt)}</p>
                    <p className="text-2xs text-faint">{relative(j.completedAt)}</p>
                  </div>
                ),
              },
              {
                key: 'hours',
                header: 'Hours',
                className: 'w-20 text-right',
                render: (j) => (
                  <span className="tnum text-[13px]">{j.report?.laborHours ?? '—'}</span>
                ),
              },
              {
                key: 'signed',
                header: 'Sign-off',
                className: 'w-28',
                render: (j) =>
                  j.signature ? (
                    <Pill tone="ok">Signed</Pill>
                  ) : (
                    <Pill tone="muted">None</Pill>
                  ),
              },
            ]}
          />
        </TablePanel>
      </div>
    </DashboardShell>
  );
}
