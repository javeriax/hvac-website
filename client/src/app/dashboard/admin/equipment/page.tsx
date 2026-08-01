'use client';

import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DataTable, TablePanel } from '@/components/dashboard/DataTable';
import { StatTile } from '@/components/charts';
import { IconAlert, IconPlus, IconSearch, IconSettings, IconWrench } from '@/components/icons';
import { Alert, Button, Modal, Pill, SelectField, TextField, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { money, titleCase } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Equipment } from '@/lib/types';

const CATEGORIES = [
  { value: 'ac-unit', label: 'AC unit' },
  { value: 'furnace', label: 'Furnace' },
  { value: 'heat-pump', label: 'Heat pump' },
  { value: 'thermostat', label: 'Thermostat' },
  { value: 'air-handler', label: 'Air handler' },
  { value: 'ductwork', label: 'Ductwork' },
  { value: 'filter', label: 'Filter' },
  { value: 'part', label: 'Part' },
];

export default function AdminEquipmentPage() {
  const { data, loading, error, reload } = useApi<Equipment[]>('/equipment');
  const { push, view } = useToasts();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const stats = useMemo(() => {
    const rows = data ?? [];
    return {
      items: rows.length,
      value: rows.reduce((a, e) => a + e.unitPrice * e.stock, 0),
      low: rows.filter((e) => e.stock <= e.reorderLevel).length,
      categories: new Set(rows.map((e) => e.category)).size,
    };
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((e) =>
      `${e.name} ${e.sku} ${e.brand} ${e.modelNumber ?? ''} ${e.category}`.toLowerCase().includes(q),
    );
  }, [data, search]);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      sku: fd.get('sku'),
      name: fd.get('name'),
      category: fd.get('category'),
      brand: fd.get('brand'),
      modelNumber: fd.get('modelNumber'),
      unitPrice: Number(fd.get('unitPrice')),
      unit: fd.get('unit'),
      stock: Number(fd.get('stock')),
      reorderLevel: Number(fd.get('reorderLevel')),
    };

    setBusy(true);
    try {
      if (editing) await api.patch(`/equipment/${editing._id}`, payload);
      else await api.post('/equipment', payload);
      push(editing ? 'Equipment updated' : 'Equipment added');
      setEditing(null);
      setCreateOpen(false);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not save', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const formFields = (item?: Equipment | null) => (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="sku" label="SKU" required defaultValue={item?.sku} placeholder="AC-CAR-16S" />
        <SelectField
          name="category"
          label="Category"
          required
          defaultValue={item?.category ?? 'part'}
          options={CATEGORIES}
        />
      </div>
      <TextField name="name" label="Name" required defaultValue={item?.name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="brand" label="Brand" required defaultValue={item?.brand} />
        <TextField name="modelNumber" label="Model number" defaultValue={item?.modelNumber} />
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <TextField
          name="unitPrice"
          type="number"
          step="0.01"
          label="Unit price"
          required
          defaultValue={item?.unitPrice}
        />
        <TextField name="unit" label="Unit" defaultValue={item?.unit ?? 'each'} />
        <TextField name="stock" type="number" label="In stock" defaultValue={item?.stock ?? 0} />
        <TextField
          name="reorderLevel"
          type="number"
          label="Reorder at"
          defaultValue={item?.reorderLevel ?? 5}
        />
      </div>
    </>
  );

  return (
    <DashboardShell
      roles={['admin']}
      title="Equipment catalogue"
      subtitle="Pricing and stock levels used by the quotation builder"
      actions={
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <IconPlus className="h-3.5 w-3.5" />
          Add item
        </Button>
      }
    >
      {view}

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Catalogue items" value={stats.items} icon={<IconWrench className="h-4 w-4" />} />
          <StatTile
            label="Stock value"
            value={money(stats.value, { cents: false })}
            icon={<IconWrench className="h-4 w-4" />}
            tone="frost"
            hint="Unit price × quantity on hand"
          />
          <StatTile
            label="Below reorder level"
            value={stats.low}
            icon={<IconAlert className="h-4 w-4" />}
            tone={stats.low ? 'danger' : 'ok'}
            hint="Needs restocking"
          />
          <StatTile label="Categories" value={stats.categories} icon={<IconSettings className="h-4 w-4" />} />
        </div>

        {stats.low > 0 && (
          <Alert tone="warn" title={`${stats.low} item(s) at or below the reorder level`}>
            Low stock on frequently used parts is the most common cause of a second visit.
          </Alert>
        )}

        <TablePanel
          toolbar={
            <div className="relative max-w-sm">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, SKU, brand or category"
                className="field pl-9"
              />
            </div>
          }
        >
          <DataTable<Equipment>
            rows={filtered}
            loading={loading}
            error={error}
            onRowClick={(row) => setEditing(row)}
            empty={{ icon: <IconWrench className="h-5 w-5" />, title: 'No equipment matches that search' }}
            columns={[
              {
                key: 'item',
                header: 'Item',
                render: (e) => (
                  <div>
                    <p className="truncate text-[13.5px] font-medium">{e.name}</p>
                    <p className="tnum text-2xs text-muted">
                      {e.sku} · {e.brand}
                      {e.modelNumber ? ` · ${e.modelNumber}` : ''}
                    </p>
                  </div>
                ),
              },
              {
                key: 'category',
                header: 'Category',
                className: 'w-36',
                render: (e) => (
                  <span className="rounded-md bg-raised px-2 py-1 text-2xs uppercase tracking-[0.08em] text-muted">
                    {titleCase(e.category)}
                  </span>
                ),
              },
              {
                key: 'price',
                header: 'Unit price',
                className: 'w-32 text-right',
                render: (e) => (
                  <div className="text-right">
                    <p className="tnum text-[13.5px] font-semibold">{money(e.unitPrice)}</p>
                    <p className="text-2xs text-faint">per {e.unit}</p>
                  </div>
                ),
              },
              {
                key: 'stock',
                header: 'Stock',
                className: 'w-28 text-right',
                render: (e) => (
                  <span
                    className={`tnum text-[13.5px] font-semibold ${
                      e.stock <= e.reorderLevel ? 'text-danger' : ''
                    }`}
                  >
                    {e.stock}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                className: 'w-28',
                render: (e) =>
                  e.stock <= e.reorderLevel ? (
                    <Pill tone="danger">Reorder</Pill>
                  ) : e.stock <= e.reorderLevel * 2 ? (
                    <Pill tone="warn">Low</Pill>
                  ) : (
                    <Pill tone="ok">In stock</Pill>
                  ),
              },
            ]}
          />
        </TablePanel>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add catalogue item" wide>
        <form onSubmit={save} className="space-y-4">
          {formFields(null)}
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={busy}>
              Add item
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.name ?? ''}`}
        wide
      >
        {editing && (
          <form onSubmit={save} className="space-y-4">
            {formFields(editing)}
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" loading={busy}>
                Save changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardShell>
  );
}
