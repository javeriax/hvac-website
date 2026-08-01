'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { IconCheck, IconClock, IconPlus, IconSettings, IconShield, IconSpark } from '@/components/icons';
import { Button, Modal, Skeleton, TextArea, TextField, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { cx, money } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { MaintenancePlan } from '@/lib/types';

export default function AdminPlansPage() {
  const { data, loading, reload } = useApi<MaintenancePlan[]>('/contracts/plans');
  const { push, view } = useToasts();
  const [editing, setEditing] = useState<MaintenancePlan | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      slug: String(fd.get('slug')).toLowerCase().trim(),
      name: fd.get('name'),
      tagline: fd.get('tagline'),
      priceMonthly: Number(fd.get('priceMonthly')),
      priceAnnual: Number(fd.get('priceAnnual')),
      visitsPerYear: Number(fd.get('visitsPerYear')),
      responseHours: Number(fd.get('responseHours')),
      repairDiscountPercent: Number(fd.get('repairDiscountPercent')),
      isPopular: fd.get('isPopular') === 'on',
      sortOrder: Number(fd.get('sortOrder')),
      features: String(fd.get('features') ?? '')
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
    };

    setBusy(true);
    try {
      if (editing) await api.patch(`/contracts/plans/${editing._id}`, payload);
      else await api.post('/contracts/plans', payload);
      push(editing ? 'Plan updated' : 'Plan created');
      setEditing(null);
      setCreateOpen(false);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not save the plan', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const formFields = (plan?: MaintenancePlan | null) => (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="Plan name" required defaultValue={plan?.name} />
        <TextField
          name="slug"
          label="Slug"
          required
          defaultValue={plan?.slug}
          hint="Lower-case identifier used in URLs"
        />
      </div>
      <TextField name="tagline" label="Tagline" defaultValue={plan?.tagline} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="priceMonthly"
          type="number"
          step="0.01"
          label="Monthly price ($)"
          required
          defaultValue={plan?.priceMonthly}
        />
        <TextField
          name="priceAnnual"
          type="number"
          step="0.01"
          label="Annual price ($)"
          required
          defaultValue={plan?.priceAnnual}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          name="visitsPerYear"
          type="number"
          label="Visits per year"
          required
          defaultValue={plan?.visitsPerYear ?? 2}
        />
        <TextField
          name="responseHours"
          type="number"
          label="Response (hours)"
          defaultValue={plan?.responseHours ?? 24}
        />
        <TextField
          name="repairDiscountPercent"
          type="number"
          label="Repair discount (%)"
          defaultValue={plan?.repairDiscountPercent ?? 10}
        />
      </div>

      <TextArea
        name="features"
        label="Features"
        rows={7}
        defaultValue={(plan?.features ?? []).join('\n')}
        hint="One per line — these appear on the pricing page."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="sortOrder" type="number" label="Sort order" defaultValue={plan?.sortOrder ?? 1} />
        <label className="flex items-end gap-2.5 pb-2.5 text-[13.5px]">
          <input type="checkbox" name="isPopular" defaultChecked={plan?.isPopular} />
          Highlight as “most popular”
        </label>
      </div>
    </>
  );

  return (
    <DashboardShell
      roles={['admin']}
      title="Maintenance plans"
      subtitle="Configure the annual service plans offered on the website"
      actions={
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <IconPlus className="h-3.5 w-3.5" />
          New plan
        </Button>
      }
    >
      {view}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {(data ?? []).map((plan) => (
            <div
              key={plan._id}
              className={cx(
                'relative flex flex-col rounded-card border bg-surface p-5',
                plan.isPopular ? 'border-frost/45' : 'border-line',
              )}
            >
              {plan.isPopular && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-pill bg-frost/12 px-2 py-0.5 text-2xs font-semibold uppercase tracking-[0.1em] text-frost">
                  <IconSpark className="h-3 w-3" />
                  Popular
                </span>
              )}

              <h2 className="text-[16px] font-semibold">{plan.name}</h2>
              <p className="mt-1 min-h-[2.5rem] text-[12.5px] leading-relaxed text-muted">
                {plan.tagline}
              </p>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="tnum text-[24px] font-semibold leading-none">
                  {money(plan.priceAnnual, { cents: false })}
                </span>
                <span className="text-2xs text-muted">/yr</span>
                <span className="tnum ml-auto text-[13px] text-muted">
                  {money(plan.priceMonthly, { cents: false })}/mo
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="flex items-center gap-1 rounded-md bg-raised px-2 py-1 text-2xs text-muted">
                  <IconShield className="h-3 w-3 text-frost" />
                  {plan.visitsPerYear}/yr
                </span>
                <span className="flex items-center gap-1 rounded-md bg-raised px-2 py-1 text-2xs text-muted">
                  <IconClock className="h-3 w-3 text-frost" />
                  {plan.responseHours}h
                </span>
                <span className="rounded-md bg-raised px-2 py-1 text-2xs text-muted">
                  −{plan.repairDiscountPercent}%
                </span>
              </div>

              <ul className="mt-4 flex-1 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-2xs leading-snug">
                    <IconCheck className="mt-0.5 h-3 w-3 shrink-0 text-frost" />
                    <span className="text-muted">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="sm"
                variant="ghost"
                className="mt-5 w-full"
                onClick={() => setEditing(plan)}
              >
                <IconSettings className="h-3.5 w-3.5" />
                Edit plan
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create a maintenance plan" wide>
        <form onSubmit={save} className="space-y-4">
          {formFields(null)}
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={busy}>
              Create plan
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
