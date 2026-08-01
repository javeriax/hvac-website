'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DataTable, TablePanel } from './DataTable';
import { IconClipboard, IconSearch, SERVICE_ICONS } from '@/components/icons';
import { Avatar, Pill, Tabs } from '@/components/ui';
import { fmtDate, relative, serviceLabel, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { ServiceRequest, User } from '@/lib/types';

const TABS = [
  { key: 'triage', label: 'Needs triage' },
  { key: 'quoted', label: 'Awaiting customer' },
  { key: 'approved', label: 'Ready to schedule' },
  { key: 'active', label: 'In progress' },
  { key: 'closed', label: 'Closed' },
  { key: 'all', label: 'All' },
];

function bucket(rows: ServiceRequest[], key: string) {
  switch (key) {
    case 'triage':
      return rows.filter((r) => ['submitted', 'reviewing'].includes(r.status));
    case 'quoted':
      return rows.filter((r) => r.status === 'quoted');
    case 'approved':
      return rows.filter((r) => r.status === 'approved');
    case 'active':
      return rows.filter((r) => ['scheduled', 'in_progress'].includes(r.status));
    case 'closed':
      return rows.filter((r) => ['completed', 'cancelled'].includes(r.status));
    default:
      return rows;
  }
}

/** Shared request queue — dispatcher and admin both work from this view. */
export function RequestsWorkspace({
  detailBase = '/dashboard/dispatcher/requests',
  initialTab = 'triage',
}: {
  detailBase?: string;
  initialTab?: string;
}) {
  const router = useRouter();
  const { data, loading, error } = useApi<ServiceRequest[]>('/service-requests');
  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    const rows = data ?? [];
    return Object.fromEntries(TABS.map((t) => [t.key, bucket(rows, t.key).length]));
  }, [data]);

  const filtered = useMemo(() => {
    let rows = bucket(data ?? [], tab);
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) =>
        `${r.title} ${r.trackingCode} ${r.contact.name} ${r.contact.email} ${r.address.city}`
          .toLowerCase()
          .includes(q),
      );
    }
    // Emergencies float to the top of every bucket.
    return rows.slice().sort((a, b) => {
      const rank = (r: ServiceRequest) =>
        r.priority === 'emergency' ? 0 : r.priority === 'high' ? 1 : 2;
      return rank(a) - rank(b) || +new Date(b.createdAt) - +new Date(a.createdAt);
    });
  }, [data, tab, search]);

  return (
    <TablePanel
      toolbar={
        <>
          <Tabs tabs={TABS.map((t) => ({ ...t, count: counts[t.key] }))} active={tab} onChange={setTab} />
          <div className="relative max-w-sm">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, code, customer or city"
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
        onRowClick={(row) => router.push(`${detailBase}/${row._id}`)}
        empty={{ icon: <IconClipboard className="h-5 w-5" />, title: 'Nothing in this bucket' }}
        columns={[
          {
            key: 'request',
            header: 'Request',
            render: (r) => {
              const Icon = SERVICE_ICONS[r.serviceType] ?? IconClipboard;
              return (
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${
                      r.priority === 'emergency'
                        ? 'border-danger/30 bg-danger/10 text-danger'
                        : 'border-line bg-sunken text-frost'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">{r.title}</p>
                    <p className="tnum text-2xs text-muted">
                      {r.trackingCode} · {serviceLabel(r.serviceType)}
                    </p>
                  </div>
                </div>
              );
            },
          },
          {
            key: 'customer',
            header: 'Customer',
            className: 'w-52',
            render: (r) => {
              const c = typeof r.customer === 'object' ? (r.customer as User) : undefined;
              return (
                <div className="flex items-center gap-2.5">
                  <Avatar name={c?.name ?? r.contact.name} src={c?.avatarUrl} size={28} />
                  <div className="min-w-0">
                    <p className="truncate text-[13px]">{c?.name ?? r.contact.name}</p>
                    <p className="truncate text-2xs text-muted">
                      {r.address.city}
                      {!c && ' · guest'}
                    </p>
                  </div>
                </div>
              );
            },
          },
          {
            key: 'raised',
            header: 'Raised',
            className: 'w-32',
            render: (r) => (
              <div>
                <p className="text-[13px]">{fmtDate(r.createdAt)}</p>
                <p className="text-2xs text-faint">{relative(r.createdAt)}</p>
              </div>
            ),
          },
          {
            key: 'priority',
            header: 'Priority',
            className: 'w-28',
            render: (r) => <Pill tone={toneFor('priority', r.priority)}>{titleCase(r.priority)}</Pill>,
          },
          {
            key: 'status',
            header: 'Status',
            className: 'w-32',
            render: (r) => <Pill tone={toneFor('request', r.status)}>{titleCase(r.status)}</Pill>,
          },
        ]}
      />
    </TablePanel>
  );
}
