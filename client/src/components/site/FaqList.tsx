'use client';

import { useState } from 'react';
import { IconMinus, IconPlus } from '@/components/icons';
import { cx } from '@/lib/format';

/** Accordion with a single open panel, grid-rows transition keeps it smooth. */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="group flex w-full items-start gap-4 px-6 py-5 text-left transition-colors hover:bg-raised"
            >
              <span className="index-mark mt-1 shrink-0 opacity-60">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={cx(
                  'flex-1 text-[15px] font-medium leading-snug transition-colors',
                  isOpen ? 'text-frost' : 'text-ink',
                )}
              >
                {item.q}
              </span>
              <span
                className={cx(
                  'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors',
                  isOpen ? 'border-frost/40 text-frost' : 'border-line text-muted group-hover:text-ink',
                )}
              >
                {isOpen ? <IconMinus className="h-3.5 w-3.5" /> : <IconPlus className="h-3.5 w-3.5" />}
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 pl-[4.25rem] pr-14 text-[14px] leading-relaxed text-muted">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
