'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  IconBell,
  IconCalendar,
  IconCheck,
  IconDoc,
  IconFlame,
  IconReceipt,
  IconShield,
  IconTruck,
  IconWrench,
} from '@/components/icons';
import { api } from '@/lib/api';
import { cx, relative } from '@/lib/format';
import { Notification } from '@/lib/types';

const ICONS: Record<string, (p: { className?: string }) => JSX.Element> = {
  request_confirmed: IconCheck,
  technician_assigned: IconTruck,
  appointment_reminder: IconCalendar,
  quotation_sent: IconDoc,
  quotation_approved: IconDoc,
  quotation_rejected: IconDoc,
  invoice_generated: IconReceipt,
  payment_received: IconReceipt,
  maintenance_due: IconShield,
  contract_renewal: IconShield,
  job_completed: IconWrench,
  system: IconFlame,
};

/** Module 9 — the notification centre. Polls every 45s while the tab is open. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ notifications: Notification[]; unreadCount: number }>(
        '/notifications',
        { limit: 25 },
      );
      setItems(data.notifications);
      setUnread(data.unreadCount);
    } catch {
      /* silent — the bell must never break the page */
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 45000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const markRead = async (id: string) => {
    setItems((list) => list.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    await api.patch(`/notifications/${id}/read`).catch(() => undefined);
  };

  const markAll = async () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await api.patch('/notifications/read-all').catch(() => undefined);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-ink"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
      >
        <IconBell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ember px-1 text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[22rem] animate-scale-in overflow-hidden rounded-xl border border-line bg-surface shadow-deep">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13.5px] font-semibold">Notifications</p>
            {unread > 0 && (
              <button onClick={markAll} className="text-2xs uppercase tracking-[0.1em] text-frost hover:opacity-80">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-[13px] text-muted">Nothing new right now.</p>
            ) : (
              items.map((n) => {
                const Icon = ICONS[n.type] ?? IconBell;
                const body = (
                  <>
                    <span
                      className={cx(
                        'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border',
                        n.read
                          ? 'border-line bg-sunken text-faint'
                          : 'border-frost/25 bg-frost/[0.08] text-frost',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-2">
                        <span
                          className={cx(
                            'flex-1 text-[13px] font-medium leading-snug',
                            n.read ? 'text-muted' : 'text-ink',
                          )}
                        >
                          {n.title}
                        </span>
                        {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />}
                      </span>
                      <span className="mt-1 block text-[12.5px] leading-snug text-muted">{n.message}</span>
                      <span className="mt-1 block text-2xs text-faint">{relative(n.createdAt)}</span>
                    </span>
                  </>
                );

                return n.link ? (
                  <Link
                    key={n._id}
                    href={n.link}
                    onClick={() => {
                      if (!n.read) void markRead(n._id);
                      setOpen(false);
                    }}
                    className="flex gap-3 border-b border-line px-4 py-3 transition-colors last:border-0 hover:bg-raised"
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    key={n._id}
                    onClick={() => !n.read && markRead(n._id)}
                    className="flex w-full gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-raised"
                  >
                    {body}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
