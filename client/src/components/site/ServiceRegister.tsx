'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cx } from '@/lib/format';
import { ServiceDef } from '@/lib/site';

/**
 * The service list on the homepage.
 *
 * One panel of rows instead of a grid of cards. It reads like a trade price
 * list and each row is a far bigger click target than a card. No icons here on
 * purpose: the number, the name and the price carry it.
 */
export function ServiceRegister({ services }: { services: ServiceDef[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-surface">
      {services.map((service, i) => {
        const urgent = service.slug === 'emergency';
        const on = active === service.slug;

        return (
          <Link
            key={service.slug}
            href={`/services#${service.slug}`}
            onMouseEnter={() => setActive(service.slug)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(service.slug)}
            onBlur={() => setActive(null)}
            className={cx(
              'group relative flex flex-col gap-3 border-b border-line px-5 py-6 transition-colors duration-300 last:border-b-0 sm:flex-row sm:items-center sm:gap-7 sm:px-8',
              urgent ? 'hover:bg-ember/[0.05]' : 'hover:bg-raised',
            )}
          >
            {/* left accent, grows from the top edge on hover */}
            <span
              aria-hidden
              className={cx(
                'absolute inset-y-0 left-0 w-[2px] origin-top transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]',
                urgent ? 'bg-ember' : 'bg-frost',
                on ? 'scale-y-100' : 'scale-y-0',
              )}
            />

            {/* index */}
            <span
              className={cx(
                'tnum shrink-0 text-[13px] tabular-nums transition-colors duration-300',
                on ? (urgent ? 'text-ember' : 'text-frost') : 'text-faint',
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            {/* name + tagline */}
            <div className="min-w-0 flex-1">
              <h3
                className={cx(
                  'text-[19px] font-semibold leading-tight tracking-[-0.015em] transition-colors duration-300 sm:text-[21px]',
                  on && urgent && 'text-ember',
                )}
              >
                {service.name}
              </h3>
              <p
                className={cx(
                  'mt-1 text-[13.5px] leading-snug',
                  urgent ? 'text-ember/90' : 'text-frost',
                )}
              >
                {service.short}
              </p>
            </div>

            {/* meta */}
            <div className="flex shrink-0 items-center gap-7 sm:gap-9">
              <div className="hidden text-right md:block">
                <p className="text-2xs uppercase tracking-[0.14em] text-faint">Typical</p>
                <p className="mt-1 text-[13px] text-muted">{service.duration}</p>
              </div>

              <div className="text-right">
                <p className="text-2xs uppercase tracking-[0.14em] text-faint">From</p>
                <p className="tnum mt-1 text-[17px] font-semibold">{service.startingAt}</p>
              </div>

              {/* chevron: a rule that grows into an arrow */}
              <span
                aria-hidden
                className={cx(
                  'hidden items-center gap-1.5 transition-colors duration-300 sm:flex',
                  on ? (urgent ? 'text-ember' : 'text-frost') : 'text-faint',
                )}
              >
                <span
                  className={cx(
                    'h-px bg-current transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]',
                    on ? 'w-7 opacity-100' : 'w-3 opacity-40',
                  )}
                />
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path
                    d="M2 8 8 2M3.4 2H8v4.6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
