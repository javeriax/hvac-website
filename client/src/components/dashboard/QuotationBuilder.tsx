'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconCheck, IconPlus, IconSearch, IconX } from '@/components/icons';
import { Alert, Button, Modal, SelectField, TextField } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { cx, money } from '@/lib/format';
import { Equipment, LineItem, Quotation, ServiceRequest } from '@/lib/types';

const KINDS: { value: LineItem['kind']; label: string }[] = [
  { value: 'labor', label: 'Labour' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'part', label: 'Part' },
  { value: 'fee', label: 'Fee' },
];

const LABOR_RATES: Record<string, number> = {
  installation: 105,
  repair: 95,
  maintenance: 85,
  inspection: 90,
  'duct-cleaning': 88,
  thermostat: 85,
  emergency: 165,
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Quote builder (module 3).
 *
 * Repeats the same discount/tax maths the server does so the dispatcher watches
 * the total move as they type. The server recalculates from the line items on
 * save regardless, so anything sent from here is only a preview.
 */
export function QuotationBuilder({
  request,
  existing,
  open,
  onClose,
  onSaved,
}: {
  request: ServiceRequest | null;
  existing?: Quotation | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [items, setItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState(8.25);
  const [discountType, setDiscountType] = useState<'none' | 'percent' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [catalogue, setCatalogue] = useState<Equipment[]>([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);

    if (existing) {
      setItems(existing.lineItems.map((li) => ({ ...li })));
      setTaxRate(existing.taxRate);
      setDiscountType(existing.discountType);
      setDiscountValue(existing.discountValue);
      setNotes(existing.notes ?? '');
    } else {
      // Seed a sensible labour line from the request's service type.
      const rate = LABOR_RATES[request?.serviceType ?? 'repair'] ?? 95;
      setItems([
        { kind: 'labor', description: 'On-site labour', quantity: 2, unitPrice: rate },
      ]);
      setTaxRate(8.25);
      setDiscountType('none');
      setDiscountValue(0);
      setNotes('');
    }

    api
      .get<Equipment[]>('/equipment')
      .then(setCatalogue)
      .catch(() => setCatalogue([]));
  }, [open, existing, request]);

  const totals = useMemo(() => {
    const sum = (kinds: LineItem['kind'][]) =>
      items.filter((i) => kinds.includes(i.kind)).reduce((a, i) => a + i.quantity * i.unitPrice, 0);

    const subtotal = round2(items.reduce((a, i) => a + i.quantity * i.unitPrice, 0));
    const discountAmount =
      discountType === 'percent'
        ? round2((subtotal * discountValue) / 100)
        : discountType === 'fixed'
          ? round2(Math.min(discountValue, subtotal))
          : 0;
    const taxable = Math.max(subtotal - discountAmount, 0);
    const taxAmount = round2((taxable * taxRate) / 100);

    return {
      labor: round2(sum(['labor'])),
      equipment: round2(sum(['equipment', 'part'])),
      subtotal,
      discountAmount,
      taxAmount,
      total: round2(taxable + taxAmount),
    };
  }, [items, taxRate, discountType, discountValue]);

  const filteredCatalogue = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return catalogue
      .filter((e) => `${e.name} ${e.sku} ${e.brand}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [catalogue, search]);

  const update = (index: number, patch: Partial<LineItem>) =>
    setItems((list) => list.map((li, i) => (i === index ? { ...li, ...patch } : li)));

  const addBlank = () =>
    setItems((list) => [...list, { kind: 'part', description: '', quantity: 1, unitPrice: 0 }]);

  const addFromCatalogue = (item: Equipment) => {
    setItems((list) => [
      ...list,
      {
        kind: item.unitPrice > 800 ? 'equipment' : 'part',
        description: item.name,
        quantity: 1,
        unitPrice: item.unitPrice,
      },
    ]);
    setSearch('');
  };

  const save = async (thenSend: boolean) => {
    if (!request) return;
    if (!items.length || items.some((i) => !i.description.trim())) {
      setError('Every line item needs a description');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = { lineItems: items, taxRate, discountType, discountValue, notes };
      const quote = existing
        ? await api.patch<Quotation>(`/quotations/${existing._id}`, payload)
        : await api.post<Quotation>('/quotations', { serviceRequest: request._id, ...payload });

      if (thenSend && quote.status === 'draft') {
        await api.post(`/quotations/${quote._id}/send`);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the quotation');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={existing ? `Edit ${existing.quoteNumber}` : 'Build a quotation'}
      subtitle={request ? `${request.trackingCode} · ${request.title}` : undefined}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="soft" size="sm" onClick={() => save(false)} loading={busy}>
            Save draft
          </Button>
          <Button size="sm" onClick={() => save(true)} loading={busy}>
            <IconCheck className="h-3.5 w-3.5" />
            Save &amp; send
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <Alert tone="danger">{error}</Alert>}

        {/* catalogue search */}
        <div>
          <span className="label">Add from equipment catalogue</span>
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU or brand…"
              className="field pl-9"
            />
          </div>
          {filteredCatalogue.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-xl border border-line bg-sunken">
              {filteredCatalogue.map((item) => (
                <button
                  key={item._id}
                  onClick={() => addFromCatalogue(item)}
                  className="flex w-full items-center justify-between gap-3 border-b border-line px-3.5 py-2.5 text-left transition-colors last:border-0 hover:bg-raised"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{item.name}</p>
                    <p className="tnum text-2xs text-muted">
                      {item.sku} · {item.brand} · {item.stock} in stock
                    </p>
                  </div>
                  <span className="tnum shrink-0 text-[13px] font-semibold">
                    {money(item.unitPrice)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* line items */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label mb-0">Line items</span>
            <Button size="xs" variant="ghost" onClick={addBlank}>
              <IconPlus className="h-3 w-3" />
              Add line
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto] gap-2 rounded-xl border border-line bg-sunken p-3 sm:grid-cols-[7rem_1fr_4.5rem_6.5rem_6rem_auto]"
              >
                <select
                  value={item.kind}
                  onChange={(e) => update(i, { kind: e.target.value as LineItem['kind'] })}
                  className="field py-1.5 text-[13px]"
                >
                  {KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>

                <input
                  value={item.description}
                  onChange={(e) => update(i, { description: e.target.value })}
                  placeholder="Description"
                  className="field py-1.5 text-[13px]"
                />

                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => update(i, { quantity: Number(e.target.value) })}
                  className="field tnum py-1.5 text-right text-[13px]"
                  aria-label="Quantity"
                />

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => update(i, { unitPrice: Number(e.target.value) })}
                  className="field tnum py-1.5 text-right text-[13px]"
                  aria-label="Unit price"
                />

                <span className="tnum flex items-center justify-end px-1 text-[13px] font-semibold">
                  {money(item.quantity * item.unitPrice)}
                </span>

                <button
                  onClick={() => setItems((list) => list.filter((_, idx) => idx !== i))}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-danger"
                  aria-label="Remove line"
                >
                  <IconX className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* pricing controls */}
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Discount type"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as typeof discountType)}
            options={[
              { value: 'none', label: 'No discount' },
              { value: 'percent', label: 'Percentage' },
              { value: 'fixed', label: 'Fixed amount' },
            ]}
          />
          <TextField
            type="number"
            min="0"
            step="0.01"
            label={discountType === 'percent' ? 'Discount %' : 'Discount $'}
            value={discountValue}
            disabled={discountType === 'none'}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
          />
          <TextField
            type="number"
            min="0"
            step="0.01"
            label="Tax rate %"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
        </div>

        <TextField
          label="Notes for the customer"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Price assumes existing line set is reusable. Permit fees billed at cost if required."
        />

        {/* live totals */}
        <div className="rounded-xl border border-line bg-sunken p-4">
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Labour</dt>
              <dd className="tnum">{money(totals.labor)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Equipment &amp; parts</dt>
              <dd className="tnum">{money(totals.equipment)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-2">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tnum">{money(totals.subtotal)}</dd>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between gap-4 text-ok">
                <dt>Discount</dt>
                <dd className="tnum">−{money(totals.discountAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Tax ({taxRate}%)</dt>
              <dd className="tnum">{money(totals.taxAmount)}</dd>
            </div>
            <div className={cx('flex items-baseline justify-between gap-4 border-t border-line pt-3')}>
              <dt className="text-[14px] font-semibold">Total</dt>
              <dd className="tnum text-[22px] font-semibold text-frost">{money(totals.total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Modal>
  );
}
