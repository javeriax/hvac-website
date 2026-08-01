'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DataTable, TablePanel } from '@/components/dashboard/DataTable';
import { StatTile } from '@/components/charts';
import { IconCheck, IconPlus, IconSearch, IconUsers } from '@/components/icons';
import { Avatar, Button, Modal, Pill, SelectField, TextField, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { addressLine, fmtDate, relative, titleCase } from '@/lib/format';
import { SERVICE_AREAS } from '@/lib/site';
import { useApi } from '@/lib/useApi';
import { User } from '@/lib/types';

export default function AdminCustomersPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useApi<User[]>('/users', { role: 'customer' });
  const { push, view } = useToasts();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const stats = useMemo(() => {
    const rows = data ?? [];
    const monthAgo = Date.now() - 30 * 86400000;
    return {
      total: rows.length,
      commercial: rows.filter((c) => c.customer?.propertyType === 'commercial').length,
      recent: rows.filter((c) => +new Date(c.createdAt) > monthAgo).length,
      inactive: rows.filter((c) => !c.isActive).length,
    };
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((c) =>
      `${c.name} ${c.email} ${c.phone ?? ''} ${c.customer?.address.city ?? ''} ${
        c.customer?.companyName ?? ''
      }`
        .toLowerCase()
        .includes(q),
    );
  }, [data, search]);

  const createCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api.post('/users', {
        name: fd.get('name'),
        email: fd.get('email'),
        password: fd.get('password'),
        phone: fd.get('phone'),
        role: 'customer',
        customer: {
          propertyType: fd.get('propertyType'),
          companyName: fd.get('companyName') || undefined,
          address: {
            line1: fd.get('line1'),
            city: fd.get('city'),
            state: fd.get('state'),
            zip: fd.get('zip'),
          },
        },
      });
      push('Customer account created');
      setCreateOpen(false);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not create the account', 'danger');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardShell
      roles={['admin']}
      title="Customers"
      subtitle="Accounts, properties and service history"
      actions={
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <IconPlus className="h-3.5 w-3.5" />
          New customer
        </Button>
      }
    >
      {view}

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Total customers" value={stats.total} icon={<IconUsers className="h-4 w-4" />} />
          <StatTile
            label="Commercial accounts"
            value={stats.commercial}
            icon={<IconUsers className="h-4 w-4" />}
            tone="ember"
            hint="Multi-unit and business sites"
          />
          <StatTile
            label="New in 30 days"
            value={stats.recent}
            icon={<IconCheck className="h-4 w-4" />}
            tone="ok"
          />
          <StatTile
            label="Deactivated"
            value={stats.inactive}
            icon={<IconUsers className="h-4 w-4" />}
            tone={stats.inactive ? 'warn' : 'ok'}
          />
        </div>

        <TablePanel
          toolbar={
            <div className="relative max-w-sm">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone, city or company"
                className="field pl-9"
              />
            </div>
          }
        >
          <DataTable<User>
            rows={filtered}
            loading={loading}
            error={error}
            onRowClick={(row) => router.push(`/dashboard/admin/customers/${row._id}`)}
            empty={{ icon: <IconUsers className="h-5 w-5" />, title: 'No customers match that search' }}
            columns={[
              {
                key: 'customer',
                header: 'Customer',
                render: (c) => (
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} src={c.avatarUrl} size={34} />
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium">{c.name}</p>
                      <p className="truncate text-2xs text-muted">
                        {c.customer?.companyName ?? c.email}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'address',
                header: 'Service address',
                className: 'w-64',
                render: (c) => (
                  <span className="truncate text-[13px] text-muted">
                    {addressLine(c.customer?.address)}
                  </span>
                ),
              },
              {
                key: 'type',
                header: 'Type',
                className: 'w-28',
                render: (c) => (
                  <Pill tone={c.customer?.propertyType === 'commercial' ? 'ember' : 'frost'}>
                    {titleCase(c.customer?.propertyType ?? 'residential')}
                  </Pill>
                ),
              },
              {
                key: 'since',
                header: 'Customer since',
                className: 'w-36',
                render: (c) => (
                  <div>
                    <p className="text-[13px]">{fmtDate(c.customer?.customerSince ?? c.createdAt)}</p>
                    <p className="text-2xs text-faint">{relative(c.customer?.customerSince ?? c.createdAt)}</p>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                className: 'w-24',
                render: (c) => (
                  <Pill tone={c.isActive ? 'ok' : 'muted'}>{c.isActive ? 'Active' : 'Inactive'}</Pill>
                ),
              },
            ]}
          />
        </TablePanel>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create a customer account"
        subtitle="Useful when a guest request needs to be converted into a full account."
        wide
      >
        <form onSubmit={createCustomer} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="name" label="Full name" required />
            <TextField name="email" type="email" label="Email" required />
            <TextField name="phone" label="Phone" type="tel" />
            <TextField
              name="password"
              type="password"
              label="Temporary password"
              required
              minLength={8}
              hint="At least 8 characters"
            />
            <SelectField
              name="propertyType"
              label="Property type"
              defaultValue="residential"
              options={[
                { value: 'residential', label: 'Residential' },
                { value: 'commercial', label: 'Commercial' },
              ]}
            />
            <TextField name="companyName" label="Company name" hint="Commercial accounts only" />
          </div>

          <TextField name="line1" label="Service address" required />
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              name="city"
              label="City"
              required
              placeholder="Select"
              options={SERVICE_AREAS.map((a) => ({ value: a.city, label: a.city }))}
            />
            <TextField name="state" label="State" defaultValue="AZ" />
            <TextField name="zip" label="ZIP" required />
          </div>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={busy}>
              Create account
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
