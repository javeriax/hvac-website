'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DataTable, TablePanel } from '@/components/dashboard/DataTable';
import { StatTile } from '@/components/charts';
import { IconCheck, IconClock, IconReceipt } from '@/components/icons';
import { Pill } from '@/components/ui';
import { fmtDate, money, relative, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Invoice, Job } from '@/lib/types';

export default function CustomerInvoicesPage() {
  const router = useRouter();
  const { data, loading, error } = useApi<Invoice[]>('/invoices');

  const stats = useMemo(() => {
    const rows = data ?? [];
    return {
      outstanding: rows.reduce((a, i) => a + i.balance, 0),
      overdue: rows.filter((i) => i.status === 'overdue').length,
      paid: rows.filter((i) => i.status === 'paid').length,
      lifetime: rows.filter((i) => i.status === 'paid').reduce((a, i) => a + i.total, 0),
    };
  }, [data]);

  return (
    <DashboardShell roles={['customer']} title="Invoices" subtitle="Balances, payment history and printable copies">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Outstanding"
            value={money(stats.outstanding, { cents: false })}
            icon={<IconReceipt className="h-4 w-4" />}
            tone={stats.outstanding > 0 ? 'ember' : 'ok'}
            hint="Across all open invoices"
          />
          <StatTile
            label="Overdue"
            value={stats.overdue}
            icon={<IconClock className="h-4 w-4" />}
            tone={stats.overdue ? 'danger' : 'ok'}
            hint="Past the due date"
          />
          <StatTile
            label="Invoices paid"
            value={stats.paid}
            icon={<IconCheck className="h-4 w-4" />}
            tone="ok"
            hint="Settled in full"
          />
          <StatTile
            label="Lifetime spend"
            value={money(stats.lifetime, { cents: false })}
            icon={<IconReceipt className="h-4 w-4" />}
            hint="Total paid to ArcticAir"
          />
        </div>

        <TablePanel title="All invoices">
          <DataTable<Invoice>
            rows={data}
            loading={loading}
            error={error}
            onRowClick={(row) => router.push(`/dashboard/customer/invoices/${row._id}`)}
            empty={{
              icon: <IconReceipt className="h-5 w-5" />,
              title: 'No invoices yet',
              body: 'Invoices are issued after a job is completed and signed off.',
            }}
            columns={[
              {
                key: 'number',
                header: 'Invoice',
                render: (inv) => {
                  const job = typeof inv.job === 'object' ? (inv.job as Job) : undefined;
                  return (
                    <div>
                      <p className="tnum text-[13.5px] font-medium">{inv.invoiceNumber}</p>
                      <p className="truncate text-2xs text-muted">{job?.title ?? 'Service work'}</p>
                    </div>
                  );
                },
              },
              {
                key: 'issued',
                header: 'Issued',
                className: 'w-32',
                render: (inv) => <span className="text-[13px] text-muted">{fmtDate(inv.issueDate)}</span>,
              },
              {
                key: 'due',
                header: 'Due',
                className: 'w-36',
                render: (inv) => (
                  <div>
                    <p className={`text-[13px] ${inv.status === 'overdue' ? 'text-danger' : ''}`}>
                      {fmtDate(inv.dueDate)}
                    </p>
                    <p className="text-2xs text-faint">{relative(inv.dueDate)}</p>
                  </div>
                ),
              },
              {
                key: 'total',
                header: 'Total',
                className: 'w-28 text-right',
                render: (inv) => <span className="tnum text-[13.5px]">{money(inv.total)}</span>,
              },
              {
                key: 'balance',
                header: 'Balance',
                className: 'w-28 text-right',
                render: (inv) => (
                  <span
                    className={`tnum text-[14px] font-semibold ${
                      inv.balance > 0 ? (inv.status === 'overdue' ? 'text-danger' : 'text-ember') : 'text-ok'
                    }`}
                  >
                    {money(inv.balance)}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                className: 'w-28',
                render: (inv) => <Pill tone={toneFor('invoice', inv.status)}>{titleCase(inv.status)}</Pill>,
              },
            ]}
          />
        </TablePanel>
      </div>
    </DashboardShell>
  );
}
