'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DataTable, TablePanel } from '@/components/dashboard/DataTable';
import { IconArrowRight, IconClipboard, IconSearch, SERVICE_ICONS } from '@/components/icons';
import { LinkButton, Pill, Tabs } from '@/components/ui';
import { fmtDate, relative, serviceLabel, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { ServiceRequest } from '@/lib/types';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'quoted', label: 'Awaiting decision' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Completed' },
];

export default function CustomerRequestsPage() {
  const router = useRouter();
  const { data, loading, error } = useApi<ServiceRequest[]>('/service-requests');
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (tab === 'open') rows = rows.filter((r) => !['completed', 'cancelled'].includes(r.status));
    if (tab === 'quoted') rows = rows.filter((r) => r.status === 'quoted');
    if (tab === 'scheduled') rows = rows.filter((r) => ['scheduled', 'in_progress'].includes(r.status));
    if (tab === 'completed') rows = rows.filter((r) => r.status === 'completed');

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.trackingCode.toLowerCase().includes(q) ||
          r.address.city.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [data, tab, search]);

  const counts = useMemo(() => {
    const rows = data ?? [];
    return {
      all: rows.length,
      open: rows.filter((r) => !['completed', 'cancelled'].includes(r.status)).length,
      quoted: rows.filter((r) => r.status === 'quoted').length,
      scheduled: rows.filter((r) => ['scheduled', 'in_progress'].includes(r.status)).length,
      completed: rows.filter((r) => r.status === 'completed').length,
    };
  }, [data]);

  return (
    <DashboardShell
      roles={['customer']}
      title="Service requests"
      subtitle="Every job you have raised with ArcticAir"
      actions={
        <LinkButton href="/request-quote" size="sm" icon={<IconArrowRight className="h-3.5 w-3.5" />}>
          New request
        </LinkButton>
      }
    >
      <TablePanel
        toolbar={
          <>
            <Tabs
              tabs={TABS.map((t) => ({ ...t, count: counts[t.key as keyof typeof counts] }))}
              active={tab}
              onChange={setTab}
            />
            <div className="relative max-w-sm">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, tracking code or city"
                className="field pl-9"
              />
            </div>
          </>
        }
      >
        <DataTable<ServiceRequest>
          rows={filtered}
          loading={loading}
          error={error}
          onRowClick={(row) => router.push(`/dashboard/customer/requests/${row._id}`)}
          empty={{
            icon: <IconClipboard className="h-5 w-5" />,
            title: 'No requests here',
            body: 'Raise a request and it will appear with a tracking code you can follow.',
          }}
          columns={[
            {
              key: 'request',
              header: 'Request',
              render: (r) => {
                const Icon = SERVICE_ICONS[r.serviceType] ?? IconClipboard;
                return (
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-sunken text-frost">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium">{r.title}</p>
                      <p className="tnum text-2xs text-muted">{r.trackingCode}</p>
                    </div>
                  </div>
                );
              },
            },
            {
              key: 'type',
              header: 'Service',
              className: 'w-36',
              render: (r) => <span className="text-[13px] text-muted">{serviceLabel(r.serviceType)}</span>,
            },
            {
              key: 'city',
              header: 'Location',
              className: 'w-32',
              render: (r) => <span className="text-[13px] text-muted">{r.address.city}</span>,
            },
            {
              key: 'raised',
              header: 'Raised',
              className: 'w-36',
              render: (r) => (
                <div>
                  <p className="text-[13px]">{fmtDate(r.createdAt)}</p>
                  <p className="text-2xs text-faint">{relative(r.createdAt)}</p>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              className: 'w-40',
              render: (r) => (
                <div className="flex flex-wrap gap-1.5">
                  <Pill tone={toneFor('request', r.status)}>{titleCase(r.status)}</Pill>
                  {r.priority === 'emergency' && <Pill tone="danger">SOS</Pill>}
                </div>
              ),
            },
          ]}
        />
      </TablePanel>
    </DashboardShell>
  );
}
