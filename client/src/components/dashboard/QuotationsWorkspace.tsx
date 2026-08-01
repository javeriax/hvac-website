'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DataTable, TablePanel } from './DataTable';
import { StatTile } from '@/components/charts';
import { IconCheck, IconClock, IconDoc, IconSend } from '@/components/icons';
import { Button, Pill, Tabs, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { fmtDate, money, relative, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Quotation, ServiceRequest, User } from '@/lib/types';

const TABS = [
  { key: 'draft', label: 'Drafts' },
  { key: 'sent', label: 'Awaiting decision' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Declined' },
  { key: 'all', label: 'All' },
];

/** Shared quotation pipeline used by the dispatcher and admin dashboards. */
export function QuotationsWorkspace({
  detailBase = '/dashboard/dispatcher/requests',
}: {
  detailBase?: string;
}) {
  const router = useRouter();
  const { data, loading, error, reload } = useApi<Quotation[]>('/quotations');
  const { push, view } = useToasts();
  const [tab, setTab] = useState('draft');
  const [sending, setSending] = useState<string | null>(null);

  const counts = useMemo(() => {
    const rows = data ?? [];
    return {
      draft: rows.filter((q) => q.status === 'draft').length,
      sent: rows.filter((q) => q.status === 'sent').length,
      accepted: rows.filter((q) => q.status === 'accepted').length,
      rejected: rows.filter((q) => q.status === 'rejected').length,
      all: rows.length,
    };
  }, [data]);

  const stats = useMemo(() => {
    const rows = data ?? [];
    const accepted = rows.filter((q) => q.status === 'accepted');
    const decided = rows.filter((q) => ['accepted', 'rejected'].includes(q.status));
    return {
      pipeline: rows.filter((q) => q.status === 'sent').reduce((a, q) => a + q.total, 0),
      won: accepted.reduce((a, q) => a + q.total, 0),
      winRate: decided.length ? Math.round((accepted.length / decided.length) * 100) : 0,
      avg: accepted.length ? accepted.reduce((a, q) => a + q.total, 0) / accepted.length : 0,
    };
  }, [data]);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return tab === 'all' ? rows : rows.filter((q) => q.status === tab);
  }, [data, tab]);

  const send = async (quote: Quotation) => {
    setSending(quote._id);
    try {
      await api.post(`/quotations/${quote._id}/send`);
      push(`${quote.quoteNumber} sent to the customer`);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not send', 'danger');
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-5">
      {view}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Open pipeline"
          value={money(stats.pipeline, { cents: false })}
          icon={<IconClock className="h-4 w-4" />}
          tone="warn"
          hint={`${counts.sent} awaiting a decision`}
        />
        <StatTile
          label="Won"
          value={money(stats.won, { cents: false })}
          icon={<IconCheck className="h-4 w-4" />}
          tone="ok"
          hint={`${counts.accepted} accepted quotations`}
        />
        <StatTile
          label="Win rate"
          value={`${stats.winRate}%`}
          icon={<IconDoc className="h-4 w-4" />}
          tone="frost"
          hint="Of quotes the customer decided on"
        />
        <StatTile
          label="Average value"
          value={money(stats.avg, { cents: false })}
          icon={<IconDoc className="h-4 w-4" />}
          hint="Per accepted quotation"
        />
      </div>

      <TablePanel
        toolbar={
          <Tabs
            tabs={TABS.map((t) => ({ ...t, count: counts[t.key as keyof typeof counts] }))}
            active={tab}
            onChange={setTab}
          />
        }
      >
        <DataTable<Quotation>
          rows={filtered}
          loading={loading}
          error={error}
          empty={{ icon: <IconDoc className="h-5 w-5" />, title: 'Nothing in this bucket' }}
          columns={[
            {
              key: 'number',
              header: 'Quote',
              render: (q) => {
                const req =
                  typeof q.serviceRequest === 'object' ? (q.serviceRequest as ServiceRequest) : undefined;
                return (
                  <button
                    onClick={() => req && router.push(`${detailBase}/${req._id}`)}
                    className="text-left"
                  >
                    <p className="tnum text-[13.5px] font-medium hover:text-frost">{q.quoteNumber}</p>
                    <p className="truncate text-2xs text-muted">{req?.title ?? '—'}</p>
                  </button>
                );
              },
            },
            {
              key: 'customer',
              header: 'Customer',
              className: 'w-44',
              render: (q) => (
                <span className="text-[13px] text-muted">
                  {typeof q.customer === 'object' ? (q.customer as User).name : '—'}
                </span>
              ),
            },
            {
              key: 'created',
              header: 'Created',
              className: 'w-32',
              render: (q) => (
                <div>
                  <p className="text-[13px]">{fmtDate(q.createdAt)}</p>
                  <p className="text-2xs text-faint">{relative(q.createdAt)}</p>
                </div>
              ),
            },
            {
              key: 'valid',
              header: 'Valid until',
              className: 'w-32',
              render: (q) => <span className="text-[13px] text-muted">{fmtDate(q.validUntil)}</span>,
            },
            {
              key: 'total',
              header: 'Total',
              className: 'w-28 text-right',
              render: (q) => <span className="tnum text-[14px] font-semibold">{money(q.total)}</span>,
            },
            {
              key: 'status',
              header: 'Status',
              className: 'w-32',
              render: (q) => <Pill tone={toneFor('quote', q.status)}>{titleCase(q.status)}</Pill>,
            },
            {
              key: 'action',
              header: '',
              className: 'w-24 text-right',
              render: (q) =>
                q.status === 'draft' ? (
                  <Button size="xs" loading={sending === q._id} onClick={() => send(q)}>
                    <IconSend className="h-3 w-3" />
                    Send
                  </Button>
                ) : null,
            },
          ]}
        />
      </TablePanel>
    </div>
  );
}
