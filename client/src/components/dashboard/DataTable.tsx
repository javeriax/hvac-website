'use client';

import { ReactNode } from 'react';
import { EmptyState, Skeleton } from '@/components/ui';
import { cx } from '@/lib/format';

export interface Column<T> {
  key: string;
  header: string;
  /** Tailwind width/alignment classes applied to both th and td. */
  className?: string;
  render: (row: T) => ReactNode;
}

export function DataTable<T extends { _id: string }>({
  columns,
  rows,
  loading,
  error,
  empty,
  onRowClick,
  compact,
}: {
  columns: Column<T>[];
  rows: T[] | null;
  loading?: boolean;
  error?: string | null;
  empty?: { title: string; body?: string; icon?: ReactNode; action?: ReactNode };
  onRowClick?: (row: T) => void;
  compact?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState title="Could not load this list">{error}</EmptyState>
    );
  }

  if (!rows?.length) {
    return (
      <EmptyState icon={empty?.icon} title={empty?.title ?? 'Nothing here yet'} action={empty?.action}>
        {empty?.body}
      </EmptyState>
    );
  }

  return (
    <div className="scroll-x">
      <table className="w-full min-w-[44rem] text-left">
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cx(
                  'whitespace-nowrap px-4 py-3 text-2xs font-semibold uppercase tracking-[0.13em] text-faint',
                  c.className,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row._id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cx(
                'border-b border-line transition-colors last:border-0',
                onRowClick && 'cursor-pointer hover:bg-raised',
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cx('px-4 align-middle', compact ? 'py-2.5' : 'py-3.5', c.className)}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Panel wrapper matching the table's edge-to-edge rows. */
export function TablePanel({
  title,
  subtitle,
  action,
  children,
  toolbar,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      {(title || action || toolbar) && (
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4">
          {(title || action) && (
            <div className="flex items-start justify-between gap-4">
              <div>
                {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
                {subtitle && <p className="mt-0.5 text-[12.5px] text-muted">{subtitle}</p>}
              </div>
              {action}
            </div>
          )}
          {toolbar}
        </div>
      )}
      {children}
    </div>
  );
}
