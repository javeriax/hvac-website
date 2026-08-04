'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { IconChevronDown, IconExternal, IconLogout, IconSettings } from '@/components/icons';
import { Avatar } from '@/components/ui';
import { SETTINGS_FOR, useAuth } from '@/lib/auth';
import { cx, titleCase } from '@/lib/format';
import { Role } from '@/lib/types';

const ROLE_TONE: Record<Role, string> = {
  customer: 'text-frost',
  technician: 'text-warn',
  dispatcher: 'text-info',
  admin: 'text-ember',
};

/**
 * Account menu for the dashboard top bar.
 *
 * Everything to do with "me" lives behind this one control: my settings, the
 * way back out to the public site, and signing out. Those used to be three
 * separate buttons sitting loose in the header next to page actions, which
 * made the bar hard to scan.
 */
export function DashboardUserMenu({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className={cx(
          'flex h-9 items-center gap-2 rounded-lg border py-1 pl-1 pr-2 transition-colors',
          open ? 'border-frost/40 bg-raised' : 'border-line hover:bg-raised',
        )}
      >
        <Avatar name={user.name} src={user.avatarUrl} size={26} />
        <span className="hidden text-[13px] font-medium sm:inline">
          {user.name.split(' ')[0]}
        </span>
        <IconChevronDown
          className={cx('h-3.5 w-3.5 shrink-0 text-faint transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-60 animate-scale-in overflow-hidden rounded-xl border border-line bg-surface shadow-deep"
        >
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <Avatar name={user.name} src={user.avatarUrl} size={34} />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-medium">{user.name}</p>
              <p
                className={cx(
                  'text-2xs font-semibold uppercase tracking-[0.12em]',
                  ROLE_TONE[user.role],
                )}
              >
                {titleCase(user.role)}
              </p>
            </div>
          </div>

          <div className="py-1">
            <Link
              href={SETTINGS_FOR[user.role]}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <IconSettings className="h-4 w-4 shrink-0 text-faint" />
              My settings
            </Link>

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <IconExternal className="h-4 w-4 shrink-0 text-faint" />
              View public site
            </Link>
          </div>

          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-3 border-t border-line px-4 py-2.5 text-left text-[13.5px] text-muted transition-colors hover:bg-raised hover:text-danger"
          >
            <IconLogout className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
