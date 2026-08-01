'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { IconArrowUpRight } from '@/components/icons';
import { SERVICE_ICONS } from '@/components/icons';
import { cx } from '@/lib/format';
import { ServiceDef } from '@/lib/site';

/**
 * Service tile with a cursor-tracking thermal highlight. The gradient follows
 * the pointer, so the whole grid reads like a warm surface being touched.
 */
export function ServiceCard({ service, index }: { service: ServiceDef; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hot, setHot] = useState(false);

  const Icon = SERVICE_ICONS[service.slug] ?? SERVICE_ICONS.repair;
  const emergency = service.slug === 'emergency';

  return (
    <Link
      ref={ref}
      href={`/services#${service.slug}`}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface p-6 transition-colors duration-300 hover:border-frost/35"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(340px circle at ${pos.x}% ${pos.y}%, rgb(var(--c-${
            emergency ? 'ember' : 'frost'
          }) / 0.10), transparent 70%)`,
        }}
      />

      <div className="relative flex items-start justify-between">
        <span
          className={cx(
            'grid h-11 w-11 place-items-center rounded-xl border transition-all duration-300',
            emergency
              ? 'border-ember/25 bg-ember/[0.08] text-ember'
              : 'border-frost/25 bg-frost/[0.08] text-frost',
            hot && 'scale-105',
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="index-mark opacity-50">{String(index + 1).padStart(2, '0')}</span>
      </div>

      <h3 className="relative mt-5 text-[17px] font-semibold leading-snug">{service.name}</h3>
      <p className="relative mt-1.5 text-[13px] text-frost">{service.short}</p>
      <p className="relative mt-3 flex-1 text-[13.5px] leading-relaxed text-muted">
        {service.description.split('.')[0]}.
      </p>

      <div className="relative mt-5 flex items-end justify-between border-t border-line pt-4">
        <div>
          <p className="text-2xs uppercase tracking-[0.14em] text-faint">From</p>
          <p className="tnum mt-0.5 text-[15px] font-semibold">{service.startingAt}</p>
        </div>
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors group-hover:text-frost">
          Details
          <IconArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
