'use client';

import { useCallback, useEffect, useState } from 'react';
import { IconAlert, IconRefresh, IconStar } from '@/components/icons';
import { Button, Skeleton } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { cx, serviceLabel } from '@/lib/format';
import { Testimonial } from '@/lib/types';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar
          key={i}
          className={cx('h-3 w-3', i < rating ? 'fill-current text-ember' : 'text-line')}
        />
      ))}
    </span>
  );
}

/**
 * The wall of published reviews.
 *
 * Column layout rather than a grid so quotes of different lengths do not leave
 * holes. Note the three distinct states below: loading, failed and genuinely
 * empty. Collapsing "the API is down" into "no reviews yet" tells the visitor
 * something untrue about the business.
 */
export function TestimonialWall({ limit, refreshKey }: { limit?: number; refreshKey?: number }) {
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await api.get<Testimonial[]>('/testimonials'));
    } catch (err) {
      setItems(null);
      setError(err instanceof ApiError ? err.message : 'Could not load customer stories');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-danger/30 bg-danger/[0.05] px-6 py-12 text-center">
        <IconAlert className="h-6 w-6 text-danger" />
        <p className="text-[14px] font-semibold">Could not load customer stories</p>
        <p className="max-w-sm text-[13px] leading-relaxed text-muted">{error}</p>
        <Button size="sm" variant="ghost" onClick={load} className="mt-1">
          <IconRefresh className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  if (!items) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-52" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <p className="rounded-card border border-line bg-surface px-6 py-12 text-center text-[13.5px] text-muted">
        No customer stories published yet. Be the first to leave one.
      </p>
    );
  }

  const visible = limit ? items.slice(0, limit) : items;

  return (
    <div className="columns-1 gap-4 md:columns-2 lg:columns-3 [&>*]:mb-4">
      {visible.map((t) => (
        <figure
          key={t._id}
          className="group relative break-inside-avoid overflow-hidden rounded-card border border-line bg-surface p-6 transition-colors hover:border-frost/25"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-3 -top-6 font-display text-[7rem] leading-none text-line/60 transition-colors group-hover:text-frost/15"
          >
            &rdquo;
          </span>

          <Stars rating={t.rating} />

          <blockquote className="relative mt-4 text-[14px] leading-relaxed text-ink/90">
            {t.quote}
          </blockquote>

          <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold">{t.author}</p>
              <p className="truncate text-2xs text-muted">
                {t.role} · {t.city}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-raised px-2 py-1 text-2xs uppercase tracking-[0.1em] text-faint">
              {serviceLabel(t.serviceType)}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
