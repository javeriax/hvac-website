'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DataTable, TablePanel } from '@/components/dashboard/DataTable';
import { StatTile } from '@/components/charts';
import { IconAlert, IconCheck, IconPlus, IconReceipt, IconSend } from '@/components/icons';
import { Alert, Button, Modal, Pill, SelectField, Tabs, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { fmtDate, money, relative, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Invoice, Job, User } from '@/lib/types';

const TABS = [
  { key: 'draft', label: 'Drafts' },
  { key: 'open', label: 'Open' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'paid', label: 'Paid' },
  { key: 'all', label: 'All' },
];

export default function AdminInvoicesPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useApi<Invoice[]>('/invoices');
  const { push, view } = useToasts();
  const [tab, setTab] = useState('open');
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  // Completed jobs that have not been invoiced yet — the natural source for a new invoice.
  const { data: jobs } = useApi<Job[]>('/jobs', { status: 'completed', limit: 300 });
  const invoicableJobs = useMemo(
    () => (jobs ?? []).filter((j) => !j.invoice),
    [jobs],
  );

  const counts = useMemo(() => {
    const rows = data ?? [];
    return {
      draft: rows.filter((i) => i.status === 'draft').length,
      open: rows.filter((i) => ['sent', 'partial', 'overdue'].includes(i.status)).length,
      overdue: rows.filter((i) => i.status === 'overdue').length,
      paid: rows.filter((i) => i.status === 'paid').length,
      all: rows.length,
    };
  }, [data]);

  const stats = useMemo(() => {
    const rows = data ?? [];
    return {
      outstanding: rows.reduce((a, i) => a + i.balance, 0),
      overdue: rows.filter((i) => i.status === 'overdue').reduce((a, i) => a + i.balance, 0),
      collected: rows.reduce((a, i) => a + i.amountPaid, 0),
      drafts: rows.filter((i) => i.status === 'draft').length,
    };
  }, [data]);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    if (tab === 'all') return rows;
    if (tab === 'open') return rows.filter((i) => ['sent', 'partial', 'overdue'].includes(i.status));
    return rows.filter((i) => i.status === tab);
  }, [data, tab]);

  const send = async (invoice: Invoice) => {
    setBusy(invoice._id);
    try {
      await api.post(`/invoices/${invoice._id}/send`);
      push(`${invoice.invoiceNumber} issued to the customer`);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not send', 'danger');
    } finally {
      setBusy(null);
    }
  };

  const createFromJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy('create');
    try {
      const invoice = await api.post<Invoice>('/invoices', { job: fd.get('job') });
      push(`${invoice.invoiceNumber} drafted`);
      setCreateOpen(false);
      await reload();
      router.push(`/dashboard/admin/invoices/${invoice._id}`);
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not create the invoice', 'danger');
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardShell
      roles={['admin']}
      title="Invoice management"
      subtitle="Generate, issue and reconcile invoices"
      actions={
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <IconPlus className="h-3.5 w-3.5" />
          New invoice
        </Button>
      }
    >
      {view}

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Outstanding"
            value={money(stats.outstanding, { cents: false })}
            icon={<IconReceipt className="h-4 w-4" />}
            tone="ember"
            hint={`${counts.open} open invoice(s)`}
          />
          <StatTile
            label="Overdue"
            value={money(stats.overdue, { cents: false })}
            icon={<IconAlert className="h-4 w-4" />}
            tone={stats.overdue ? 'danger' : 'ok'}
            hint={`${counts.overdue} past the due date`}
          />
          <StatTile
            label="Collected"
            value={money(stats.collected, { cents: false })}
            icon={<IconCheck className="h-4 w-4" />}
            tone="ok"
            hint="Across every invoice"
          />
          <StatTile
            label="Unissued drafts"
            value={stats.drafts}
            icon={<IconSend className="h-4 w-4" />}
            tone={stats.drafts ? 'warn' : 'ok'}
            hint="Not yet sent to the customer"
          />
        </div>

        {invoicableJobs.length > 0 && (
          <Alert tone="info" title={`${invoicableJobs.length} completed job(s) not yet invoiced`}>
            Work has been signed off but no invoice exists. Create one to bill the customer.
          </Alert>
        )}

        <TablePanel
          toolbar={
            <Tabs
              tabs={TABS.map((t) => ({ ...t, count: counts[t.key as keyof typeof counts] }))}
              active={tab}
              onChange={setTab}
            />
          }
        >
          <DataTable<Invoice>
            rows={filtered}
            loading={loading}
            error={error}
            onRowClick={(row) => router.push(`/dashboard/admin/invoices/${row._id}`)}
            empty={{ icon: <IconReceipt className="h-5 w-5" />, title: 'Nothing in this bucket' }}
            columns={[
              {
                key: 'number',
                header: 'Invoice',
                render: (inv) => {
                  const job = typeof inv.job === 'object' ? (inv.job as Job) : undefined;
                  return (
                    <div>
                      <p className="tnum text-[13.5px] font-medium">{inv.invoiceNumber}</p>
                      <p className="truncate text-2xs text-muted">{job?.title ?? 'Manual invoice'}</p>
                    </div>
                  );
                },
              },
              {
                key: 'customer',
                header: 'Customer',
                className: 'w-44',
                render: (inv) => (
                  <span className="text-[13px] text-muted">
                    {typeof inv.customer === 'object' ? (inv.customer as User).name : '—'}
                  </span>
                ),
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
                render: (inv) => <span className="tnum text-[13px]">{money(inv.total)}</span>,
              },
              {
                key: 'balance',
                header: 'Balance',
                className: 'w-28 text-right',
                render: (inv) => (
                  <span
                    className={`tnum text-[14px] font-semibold ${
                      inv.balance > 0
                        ? inv.status === 'overdue'
                          ? 'text-danger'
                          : 'text-ember'
                        : 'text-ok'
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
              {
                key: 'action',
                header: '',
                className: 'w-24 text-right',
                render: (inv) =>
                  inv.status === 'draft' ? (
                    <Button
                      size="xs"
                      loading={busy === inv._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        void send(inv);
                      }}
                    >
                      <IconSend className="h-3 w-3" />
                      Issue
                    </Button>
                  ) : null,
              },
            ]}
          />
        </TablePanel>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create an invoice"
        subtitle="Line items are pulled from the accepted quotation, or from the technician's report."
      >
        <form onSubmit={createFromJob} className="space-y-4">
          <SelectField
            name="job"
            label="Completed job"
            required
            placeholder="Select a job to invoice"
            options={invoicableJobs.map((j) => ({
              value: j._id,
              label: `${j.jobNumber} — ${j.title} (${
                typeof j.customer === 'object' ? (j.customer as User).name : ''
              })`,
            }))}
            hint={
              invoicableJobs.length
                ? undefined
                : 'Every completed job has already been invoiced.'
            }
          />
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={busy === 'create'} disabled={!invoicableJobs.length}>
              Create draft
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
