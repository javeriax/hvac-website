'use client';

import { useState } from 'react';
import { IconChevronDown } from '@/components/icons';
import { Dot } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cx, titleCase, toneFor } from '@/lib/format';
import { TechStatus, User } from '@/lib/types';

const OPTIONS: TechStatus[] = ['available', 'on_job', 'off_duty', 'on_leave'];

/** Lets a technician publish their own availability to the dispatch board. */
export function TechStatusToggle() {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const current = user?.technician?.status ?? 'available';

  const change = async (status: TechStatus) => {
    setOpen(false);
    if (status === current) return;
    setBusy(true);
    try {
      const updated = await api.patch<User>('/users/me/technician-status', { status });
      setUser(updated);
    } catch {
      /* the dispatcher board will still show the last known state */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        className={cx(
          'flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[13px] transition-colors hover:bg-raised',
          busy && 'opacity-60',
        )}
      >
        <Dot tone={toneFor('tech', current)} pulse={current === 'available'} />
        <span className="hidden sm:inline">{titleCase(current)}</span>
        <IconChevronDown className="h-3.5 w-3.5 text-faint" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-44 animate-scale-in overflow-hidden rounded-xl border border-line bg-surface shadow-deep">
            {OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => change(status)}
                className={cx(
                  'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] transition-colors hover:bg-raised',
                  status === current && 'bg-raised',
                )}
              >
                <Dot tone={toneFor('tech', status)} />
                {titleCase(status)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
