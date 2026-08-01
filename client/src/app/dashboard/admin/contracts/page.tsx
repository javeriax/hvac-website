'use client';

import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DataTable, TablePanel } from '@/components/dashboard/DataTable';
import { StatTile } from '@/components/charts';
import { IconBell, IconCheck, IconClock, IconRefresh, IconShield } from '@/components/icons';
import { Alert, Button, Meter, Pill, Tabs, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { fmtDate, money, relative, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { MaintenanceContract, User } from '@/lib/types';

const TABS = [
  { key: 'expiring', label: 'Renewal queue' },
  { key: 'active', label: 'Active' },
  { key: 'expired', label: 'Expired' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'all', label: 'All' },
];

export default function AdminContractsPage() {
  const { data, loading, error, reload } = useApi<MaintenanceContract[]>('/contracts');
  const { push, view } = useToasts();
  const [tab, setTab] = useState('expiring');
  const [busy, setBusy] = useState<string | null>(null);

  const counts = useMemo(() => {
    const rows = data ?? [];
    return {
      expiring: rows.filter((c) => c.status === 'expiring').length,
      active: rows.filter((c) => c.status === 'active').length,
      expired: rows.filter((c) => c.status === 'expired').length,
      cancelled: rows.filter((c) => c.status === 'cancelled').length,
      all: rows.length,
    };
  }, [data]);

  const stats = useMemo(() => {
    const rows = data ?? [];
    const live = rows.filter((c) => ['active', 'expiring'].includes(c.status));
    return {
      live: live.length,
      recurring: live.reduce((a, c) => a + (c.billingCycle === 'annual' ? c.amount : c.amount * 12), 0),
      autoRenew: live.filter((c) => c.autoRenew).length,
      visitsDue: live.reduce((a, c) => a + (c.visitsTotal - c.visitsUsed), 0),
    };
  }, [data]);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return tab === 'all' ? rows : rows.filter((c) => c.status === tab);
  }, [data, tab]);

  const sendReminders = async () => {
    setBusy('reminders');
    try {
      const res = await api.post<{ checked: number; sent: number }>('/contracts/reminders', {});
      push(`${res.sent} renewal reminder(s) sent across ${res.checked} contract(s)`);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not send reminders', 'danger');
    } finally {
      setBusy(null);
    }
  };

  const renew = async (contract: MaintenanceContract) => {
    setBusy(contract._id);
    try {
      await api.post(`/contracts/${contract._id}/renew`, {});
      push(`${contract.contractNumber} renewed for another year`);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not renew', 'danger');
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardShell
      roles={['admin']}
      title="Maintenance contracts"
      subtitle="Renewals, coverage and recurring revenue"
      actions={
        <Button size="sm" onClick={sendReminders} loading={busy === 'reminders'}>
          <IconBell className="h-3.5 w-3.5" />
          Send renewal reminders
        </Button>
      }
    >
      {view}

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Live contracts"
            value={stats.live}
            icon={<IconShield className="h-4 w-4" />}
            tone="ok"
            hint={`${stats.autoRenew} set to auto-renew`}
          />
          <StatTile
            label="Recurring revenue"
            value={money(stats.recurring, { cents: false })}
            icon={<IconCheck className="h-4 w-4" />}
            tone="frost"
            hint="Annualised across live contracts"
          />
          <StatTile
            label="In renewal window"
            value={counts.expiring}
            icon={<IconClock className="h-4 w-4" />}
            tone={counts.expiring ? 'warn' : 'ok'}
            hint="Expiring within 60 days"
          />
          <StatTile
            label="Visits still owed"
            value={stats.visitsDue}
            icon={<IconRefresh className="h-4 w-4" />}
            hint="Across all live contracts"
          />
        </div>

        {counts.expiring > 0 && (
          <Alert tone="warn" title={`${counts.expiring} contract(s) expiring within 60 days`}>
            Send reminders now — renewals chased inside the window convert far better than a lapsed
            contract chased afterwards.
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
          <DataTable<MaintenanceContract>
            rows={filtered}
            loading={loading}
            error={error}
            empty={{ icon: <IconShield className="h-5 w-5" />, title: 'Nothing in this bucket' }}
            columns={[
              {
                key: 'contract',
                header: 'Contract',
                render: (c) => (
                  <div>
                    <p className="tnum text-[13.5px] font-medium">{c.contractNumber}</p>
                    <p className="text-2xs text-muted">{c.planName}</p>
                  </div>
                ),
              },
              {
                key: 'customer',
                header: 'Customer',
                className: 'w-44',
                render: (c) => (
                  <span className="text-[13px] text-muted">
                    {typeof c.customer === 'object' ? (c.customer as User).name : '—'}
                  </span>
                ),
              },
              {
                key: 'term',
                header: 'Term ends',
                className: 'w-36',
                render: (c) => (
                  <div>
                    <p className="text-[13px]">{fmtDate(c.endDate)}</p>
                    <p
                      className={`text-2xs ${
                        c.status === 'expiring' ? 'text-warn' : c.status === 'expired' ? 'text-danger' : 'text-faint'
                      }`}
                    >
                      {relative(c.endDate)}
                    </p>
                  </div>
                ),
              },
              {
                key: 'visits',
                header: 'Visits used',
                className: 'w-32',
                render: (c) => (
                  <div>
                    <p className="tnum text-2xs text-muted">
                      {c.visitsUsed} / {c.visitsTotal}
                    </p>
                    <Meter value={c.visitsUsed} max={c.visitsTotal} className="mt-1.5" />
                  </div>
                ),
              },
              {
                key: 'value',
                header: 'Value',
                className: 'w-28 text-right',
                render: (c) => (
                  <div className="text-right">
                    <p className="tnum text-[13.5px] font-semibold">{money(c.amount, { cents: false })}</p>
                    <p className="text-2xs text-faint">/{c.billingCycle === 'annual' ? 'yr' : 'mo'}</p>
                  </div>
                ),
              },
              {
                key: 'renew',
                header: 'Auto',
                className: 'w-20',
                render: (c) => (
                  <span className={`text-2xs font-semibold ${c.autoRenew ? 'text-ok' : 'text-faint'}`}>
                    {c.autoRenew ? 'ON' : 'OFF'}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                className: 'w-28',
                render: (c) => <Pill tone={toneFor('contract', c.status)}>{titleCase(c.status)}</Pill>,
              },
              {
                key: 'action',
                header: '',
                className: 'w-24 text-right',
                render: (c) =>
                  ['expiring', 'expired'].includes(c.status) ? (
                    <Button size="xs" loading={busy === c._id} onClick={() => renew(c)}>
                      <IconRefresh className="h-3 w-3" />
                      Renew
                    </Button>
                  ) : null,
              },
            ]}
          />
        </TablePanel>
      </div>
    </DashboardShell>
  );
}
