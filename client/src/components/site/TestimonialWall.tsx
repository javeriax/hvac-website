'use client';

import { useEffect, useState } from 'react';
import { IconStar } from '@/components/icons';
import { Skeleton } from '@/components/ui';
import { api } from '@/lib/api';
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

/** Masonry-ish wall — column layout keeps ragged quote lengths from creating gaps. */
export function TestimonialWall({ limit }: { limit?: number }) {
  const [items, setItems] = useState<Testimonial[] | null>(null);

  useEffect(() => {
    api
      .get<Testimonial[]>('/testimonials')
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

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
    return <p className="text-center text-[13px] text-muted">No customer stories published yet.</p>;
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
