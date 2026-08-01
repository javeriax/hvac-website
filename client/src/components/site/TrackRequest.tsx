'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconMapPin,
  IconSearch,
  IconTruck,
  IconUser,
} from '@/components/icons';
import { Alert, Button, EmptyState, Pill, Spinner, TextField } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { cx, fmtDateTime, relative, serviceLabel, titleCase, toneFor } from '@/lib/format';

interface TrackResult {
  trackingCode: string;
  title: string;
  serviceType: string;
  status: string;
  priority: string;
  createdAt: string;
  preferredDate?: string;
  city: string;
  customerName: string;
  timeline: { status: string; note?: string; at: string }[];
  job?: {
    jobNumber: string;
    status: string;
    scheduledStart: string;
    technician?: { name: string };
  };
  quotation?: { quoteNumber: string; status: string; total: number; validUntil: string };
}

/** The five customer-visible stages, in order. */
const STAGES = [
  { key: 'submitted', label: 'Received' },
  { key: 'reviewing', label: 'Under review' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Completed' },
];

function stageIndex(status: string) {
  if (status === 'cancelled') return -1;
  if (status === 'approved') return 2;
  if (status === 'in_progress') return 3;
  const i = STAGES.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

export function TrackRequest() {
  const params = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrackResult | null>(null);

  const lookup = useCallback(async (raw: string) => {
    const value = raw.trim().toUpperCase();
    if (!value) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      setData(await api.get<TrackResult>(`/service-requests/track/${encodeURIComponent(value)}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Deep link support — /track?code=SR-XXXXXX runs the lookup on load.
  useEffect(() => {
    const initial = params.get('code');
    if (initial) {
      setCode(initial.toUpperCase());
      void lookup(initial);
    }
  }, [params, lookup]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void lookup(code);
  };

  const current = data ? stageIndex(data.status) : 0;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="rounded-card border border-line bg-surface p-6">
        <label className="label" htmlFor="tracking-code">
          Tracking code
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              id="tracking-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SR-7K4M2Q"
              className="field tnum pl-10 uppercase tracking-[0.08em]"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <Button type="submit" loading={loading} className="sm:w-auto">
            {loading ? 'Looking up' : 'Track request'}
            {!loading && <IconArrowRight className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-2.5 text-xs text-faint">
          The code appears on your confirmation email and on screen right after you submit a
          request.
        </p>
      </form>

      {error && <Alert tone="danger">{error}</Alert>}

      {loading && (
        <div className="flex items-center justify-center gap-3 rounded-card border border-line bg-surface py-16 text-muted">
          <Spinner />
          <span className="text-[13.5px]">Fetching status…</span>
        </div>
      )}

      {!loading && !data && !error && (
        <div className="rounded-card border border-line bg-surface">
          <EmptyState icon={<IconSearch className="h-5 w-5" />} title="Enter a tracking code">
            No account needed. Every request we log gets a short code you can check any time.
          </EmptyState>
        </div>
      )}

      {data && (
        <div className="animate-fade-up space-y-4">
          {/* header */}
          <div className="rounded-card border border-line bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="tnum text-[13px] font-semibold text-frost">
                    {data.trackingCode}
                  </span>
                  <Pill tone={toneFor('request', data.status)}>{titleCase(data.status)}</Pill>
                  {data.priority === 'emergency' && <Pill tone="danger">Emergency</Pill>}
                </div>
                <h2 className="mt-3 text-[21px] font-semibold leading-snug">{data.title}</h2>
                <p className="mt-1.5 text-[13px] text-muted">
                  {serviceLabel(data.serviceType)} · {data.city} · raised {relative(data.createdAt)}
                </p>
              </div>
              <Link href="/login" className="btn-ghost btn-sm">
                Sign in for full history
              </Link>
            </div>

            {/* stage rail */}
            <div className="mt-8">
              {data.status === 'cancelled' ? (
                <Alert tone="warn" title="This request was cancelled">
                  Nothing further is scheduled. If that was not intentional, please call dispatch.
                </Alert>
              ) : (
                <div className="flex items-center">
                  {STAGES.map((stage, i) => {
                    const done = i < current;
                    const active = i === current;
                    return (
                      <div key={stage.key} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={cx(
                              'grid h-7 w-7 place-items-center rounded-full border transition-colors',
                              done
                                ? 'border-ok/50 bg-ok/12 text-ok'
                                : active
                                  ? 'border-frost bg-frost/12 text-frost'
                                  : 'border-line text-faint',
                            )}
                          >
                            {done ? (
                              <IconCheck className="h-3.5 w-3.5" />
                            ) : (
                              <span className="tnum text-[10px]">{i + 1}</span>
                            )}
                          </span>
                          <span
                            className={cx(
                              'whitespace-nowrap text-2xs uppercase tracking-[0.1em]',
                              active ? 'text-frost' : done ? 'text-muted' : 'text-faint',
                            )}
                          >
                            {stage.label}
                          </span>
                        </div>
                        {i < STAGES.length - 1 && (
                          <span
                            className={cx(
                              'mx-1 -mt-6 h-px flex-1 transition-colors sm:mx-2',
                              done ? 'bg-ok/40' : 'bg-line',
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* visit + quote */}
          <div className="grid gap-4 md:grid-cols-2">
            {data.job && (
              <div className="rounded-card border border-line bg-surface p-5">
                <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-faint">
                  Scheduled visit
                </p>
                <p className="tnum mt-3 text-[15px] font-semibold">{data.job.jobNumber}</p>
                <div className="mt-3 space-y-2 text-[13px]">
                  <p className="flex items-center gap-2 text-muted">
                    <IconClock className="h-3.5 w-3.5 text-frost" />
                    {fmtDateTime(data.job.scheduledStart)}
                  </p>
                  {data.job.technician && (
                    <p className="flex items-center gap-2 text-muted">
                      <IconUser className="h-3.5 w-3.5 text-frost" />
                      {data.job.technician.name}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-muted">
                    <IconTruck className="h-3.5 w-3.5 text-frost" />
                    {titleCase(data.job.status)}
                  </p>
                </div>
              </div>
            )}

            {data.quotation && (
              <div className="rounded-card border border-line bg-surface p-5">
                <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-faint">
                  Quotation
                </p>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="tnum text-[15px] font-semibold">{data.quotation.quoteNumber}</span>
                  <Pill tone={toneFor('quote', data.quotation.status)}>
                    {titleCase(data.quotation.status)}
                  </Pill>
                </div>
                <p className="tnum mt-3 text-[26px] font-semibold">
                  ${data.quotation.total.toFixed(2)}
                </p>
                <p className="mt-1 text-2xs text-muted">
                  Valid until {fmtDateTime(data.quotation.validUntil)}
                </p>
                <Link href="/login" className="btn-primary btn-sm mt-4 w-full">
                  Sign in to respond
                </Link>
              </div>
            )}
          </div>

          {/* timeline */}
          <div className="rounded-card border border-line bg-surface p-6">
            <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-faint">
              Activity
            </p>
            <ol className="relative mt-5 space-y-5 border-l border-line pl-6">
              {[...data.timeline].reverse().map((entry, i) => (
                <li key={`${entry.status}-${entry.at}-${i}`} className="relative">
                  <span
                    className={cx(
                      'absolute -left-[1.79rem] top-1 h-2.5 w-2.5 rounded-full border-2 bg-surface',
                      i === 0 ? 'border-frost' : 'border-line',
                    )}
                  />
                  <p className="text-[13.5px] font-medium">{titleCase(entry.status)}</p>
                  {entry.note && <p className="mt-0.5 text-[13px] text-muted">{entry.note}</p>}
                  <p className="tnum mt-1 text-2xs text-faint">{fmtDateTime(entry.at)}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-start gap-3 rounded-card border border-line bg-sunken px-5 py-4">
            <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-frost" />
            <p className="text-[13px] leading-relaxed text-muted">
              Want the photos, service report and invoice too?{' '}
              <Link href="/register" className="link-underline text-frost">
                Create an account
              </Link>{' '}
              with the same email you used on this request and it will link automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
