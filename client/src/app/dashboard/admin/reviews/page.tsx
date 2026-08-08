'use client';

import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StatTile } from '@/components/charts';
import { IconCheck, IconClock, IconStar, IconX } from '@/components/icons';
import { Alert, Button, EmptyState, Pill, Skeleton, Tabs, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { cx, fmtDate, relative, serviceLabel } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Testimonial, User } from '@/lib/types';

const TABS = [
  { key: 'pending', label: 'Awaiting approval' },
  { key: 'published', label: 'Published' },
  { key: 'all', label: 'All' },
];

export default function AdminReviewsPage() {
  const { data, loading, error, reload } = useApi<Testimonial[]>('/admin/testimonials');
  const { push, view } = useToasts();
  const [tab, setTab] = useState('pending');
  const [busy, setBusy] = useState<string | null>(null);

  const counts = useMemo(() => {
    const rows = data ?? [];
    return {
      pending: rows.filter((r) => !r.isPublished).length,
      published: rows.filter((r) => r.isPublished).length,
      all: rows.length,
    };
  }, [data]);

  const average = useMemo(() => {
    const live = (data ?? []).filter((r) => r.isPublished);
    if (!live.length) return 0;
    return live.reduce((a, r) => a + r.rating, 0) / live.length;
  }, [data]);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    if (tab === 'pending') return rows.filter((r) => !r.isPublished);
    if (tab === 'published') return rows.filter((r) => r.isPublished);
    return rows;
  }, [data, tab]);

  const setPublished = async (review: Testimonial, isPublished: boolean) => {
    setBusy(review._id);
    try {
      await api.patch(`/admin/testimonials/${review._id}`, { isPublished });
      push(isPublished ? 'Review published to the website' : 'Review hidden from the website');
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not update the review', 'danger');
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardShell
      roles={['admin']}
      title="Customer reviews"
      subtitle="Approve what appears on the public site"
    >
      {view}

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Awaiting approval"
            value={counts.pending}
            icon={<IconClock className="h-4 w-4" />}
            tone={counts.pending ? 'warn' : 'ok'}
            hint="Not visible to the public yet"
          />
          <StatTile
            label="Published"
            value={counts.published}
            icon={<IconCheck className="h-4 w-4" />}
            tone="ok"
            hint="Live on the testimonials page"
          />
          <StatTile
            label="Average rating"
            value={average ? average.toFixed(1) : '—'}
            icon={<IconStar className="h-4 w-4" />}
            tone="ember"
            hint="Across published reviews"
          />
        </div>

        {counts.pending > 0 && (
          <Alert tone="warn" title={`${counts.pending} review(s) waiting on you`}>
            Reviews stay hidden until you approve them, so the customer is still waiting to see
            theirs appear.
          </Alert>
        )}

        <div className="overflow-hidden rounded-card border border-line bg-surface">
          <div className="border-b border-line px-5 py-4">
            <Tabs
              tabs={TABS.map((t) => ({ ...t, count: counts[t.key as keyof typeof counts] }))}
              active={tab}
              onChange={setTab}
            />
          </div>

          {loading && (
            <div className="space-y-2 p-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          )}

          {error && <EmptyState title="Could not load reviews">{error}</EmptyState>}

          {!loading && !error && filtered.length === 0 && (
            <EmptyState icon={<IconStar className="h-5 w-5" />} title="Nothing in this bucket" />
          )}

          {!loading && filtered.length > 0 && (
            <ul className="divide-y divide-line">
              {filtered.map((r) => {
                const customer = typeof r.customer === 'object' ? (r.customer as User) : null;
                return (
                  <li key={r._id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <IconStar
                                key={i}
                                className={cx(
                                  'h-3.5 w-3.5',
                                  i < r.rating ? 'fill-current text-ember' : 'text-line',
                                )}
                              />
                            ))}
                          </span>
                          <Pill tone={r.isPublished ? 'ok' : 'warn'}>
                            {r.isPublished ? 'Published' : 'Pending'}
                          </Pill>
                          <span className="text-2xs text-muted">{serviceLabel(r.serviceType)}</span>
                        </div>

                        <p className="mt-3 max-w-3xl text-[14px] leading-relaxed">{r.quote}</p>

                        <p className="mt-3 text-2xs text-muted">
                          {r.author} · {r.role} · {r.city} · {fmtDate(r.createdAt)} (
                          {relative(r.createdAt)})
                          {customer?.email ? ` · ${customer.email}` : ' · seeded demo review'}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        {r.isPublished ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            loading={busy === r._id}
                            onClick={() => setPublished(r, false)}
                          >
                            <IconX className="h-3.5 w-3.5" />
                            Hide
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            loading={busy === r._id}
                            onClick={() => setPublished(r, true)}
                          >
                            <IconCheck className="h-3.5 w-3.5" />
                            Publish
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
