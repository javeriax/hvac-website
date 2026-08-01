'use client';

import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StatTile } from '@/components/charts';
import { IconCheck, IconMail, IconPhone, IconUser } from '@/components/icons';
import { Button, EmptyState, Pill, Skeleton, Tabs, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { cx, fmtDateTime, relative } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { ContactMessage } from '@/lib/types';

const TABS = [
  { key: 'new', label: 'New' },
  { key: 'read', label: 'Read' },
  { key: 'responded', label: 'Responded' },
  { key: 'archived', label: 'Archived' },
  { key: 'all', label: 'All' },
];

const TONE: Record<string, 'info' | 'warn' | 'ok' | 'muted'> = {
  new: 'info',
  read: 'warn',
  responded: 'ok',
  archived: 'muted',
};

export default function AdminMessagesPage() {
  const { data, loading, reload } = useApi<ContactMessage[]>('/contact-messages');
  const { push, view } = useToasts();
  const [tab, setTab] = useState('new');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => {
    const rows = data ?? [];
    return {
      new: rows.filter((m) => m.status === 'new').length,
      read: rows.filter((m) => m.status === 'read').length,
      responded: rows.filter((m) => m.status === 'responded').length,
      archived: rows.filter((m) => m.status === 'archived').length,
      all: rows.length,
    };
  }, [data]);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return tab === 'all' ? rows : rows.filter((m) => m.status === tab);
  }, [data, tab]);

  const setStatus = async (message: ContactMessage, status: ContactMessage['status']) => {
    setBusy(true);
    try {
      await api.patch(`/contact-messages/${message._id}`, { status });
      push(`Marked as ${status}`);
      setSelected({ ...message, status });
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not update', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const open = (message: ContactMessage) => {
    setSelected(message);
    if (message.status === 'new') void setStatus(message, 'read');
  };

  return (
    <DashboardShell
      roles={['admin']}
      title="Contact enquiries"
      subtitle="Messages submitted through the website"
    >
      {view}

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Unread"
            value={counts.new}
            icon={<IconMail className="h-4 w-4" />}
            tone={counts.new ? 'ember' : 'ok'}
            hint="Awaiting a first look"
          />
          <StatTile
            label="Awaiting reply"
            value={counts.read}
            icon={<IconUser className="h-4 w-4" />}
            tone={counts.read ? 'warn' : 'ok'}
          />
          <StatTile
            label="Responded"
            value={counts.responded}
            icon={<IconCheck className="h-4 w-4" />}
            tone="ok"
          />
          <StatTile label="Total received" value={counts.all} icon={<IconMail className="h-4 w-4" />} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          {/* list */}
          <div className="overflow-hidden rounded-card border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <Tabs
                tabs={TABS.map((t) => ({ ...t, count: counts[t.key as keyof typeof counts] }))}
                active={tab}
                onChange={setTab}
              />
            </div>

            {loading ? (
              <div className="space-y-2 p-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={<IconMail className="h-5 w-5" />} title="Nothing in this bucket" />
            ) : (
              <ul className="max-h-[36rem] divide-y divide-line overflow-y-auto">
                {filtered.map((m) => (
                  <li key={m._id}>
                    <button
                      onClick={() => open(m)}
                      className={cx(
                        'w-full px-4 py-3.5 text-left transition-colors hover:bg-raised',
                        selected?._id === m._id && 'bg-raised',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-[13.5px] font-medium">{m.name}</p>
                        <Pill tone={TONE[m.status]}>{m.status}</Pill>
                      </div>
                      <p className="mt-1 truncate text-[13px] text-frost">{m.subject}</p>
                      <p className="mt-1 line-clamp-2 text-2xs leading-snug text-muted">{m.message}</p>
                      <p className="mt-1.5 text-2xs text-faint">{relative(m.createdAt)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* detail */}
          <div className="rounded-card border border-line bg-surface p-6">
            {!selected ? (
              <EmptyState icon={<IconMail className="h-5 w-5" />} title="Select a message">
                Open an enquiry to read it in full and mark where it has got to.
              </EmptyState>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[19px] font-semibold leading-snug">{selected.subject}</h2>
                    <p className="mt-1.5 text-[13px] text-muted">
                      From {selected.name} · {fmtDateTime(selected.createdAt)}
                    </p>
                  </div>
                  <Pill tone={TONE[selected.status]}>{selected.status}</Pill>
                </div>

                <div className="mt-5 flex flex-wrap gap-4 border-y border-line py-4 text-[13px]">
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center gap-2 text-frost hover:opacity-80"
                  >
                    <IconMail className="h-3.5 w-3.5" />
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone.replace(/\D/g, '')}`}
                      className="tnum flex items-center gap-2 text-frost hover:opacity-80"
                    >
                      <IconPhone className="h-3.5 w-3.5" />
                      {selected.phone}
                    </a>
                  )}
                </div>

                <p className="mt-5 whitespace-pre-line text-[14px] leading-relaxed">
                  {selected.message}
                </p>

                <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-5">
                  <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`} className="btn-primary btn-sm">
                    <IconMail className="h-3.5 w-3.5" />
                    Reply by email
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={busy}
                    onClick={() => setStatus(selected, 'responded')}
                  >
                    <IconCheck className="h-3.5 w-3.5" />
                    Mark responded
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={busy}
                    onClick={() => setStatus(selected, 'archived')}
                  >
                    Archive
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
