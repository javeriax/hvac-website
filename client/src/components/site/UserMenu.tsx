'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { IconChevronDown, IconGrid, IconLogout, IconSettings } from '@/components/icons';
import { Avatar } from '@/components/ui';
import { HOME_FOR, SETTINGS_FOR, useAuth } from '@/lib/auth';
import { cx, titleCase } from '@/lib/format';
import { Role } from '@/lib/types';

const ROLE_TONE: Record<Role, string> = {
  customer: 'text-frost',
  technician: 'text-warn',
  dispatcher: 'text-info',
  admin: 'text-ember',
};

/**
 * Signed-in account menu for the public site header.
 *
 * Without this, someone browsing the marketing pages while logged in has no
 * obvious way back into their dashboard or out of their session.
 */
export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on an outside click or Escape.
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

  const firstName = user.name.split(' ')[0];

  const items = [
    { href: HOME_FOR[user.role], label: 'Dashboard', icon: IconGrid },
    { href: SETTINGS_FOR[user.role], label: 'Settings', icon: IconSettings },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cx(
          'flex items-center gap-2 rounded-pill border py-1 pl-1 pr-2.5 transition-colors',
          open ? 'border-frost/40 bg-raised' : 'border-line hover:bg-raised',
        )}
      >
        <Avatar name={user.name} src={user.avatarUrl} size={26} />
        <span className="hidden text-[13px] font-medium sm:inline">{firstName}</span>
        <IconChevronDown
          className={cx('h-3.5 w-3.5 text-faint transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-56 animate-scale-in overflow-hidden rounded-xl border border-line bg-surface shadow-deep"
        >
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <Avatar name={user.name} src={user.avatarUrl} size={34} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{user.name}</p>
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

          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <item.icon className="h-4 w-4 text-faint" />
              {item.label}
            </Link>
          ))}

          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
              router.push('/');
            }}
            className="flex w-full items-center gap-3 border-t border-line px-4 py-2.5 text-left text-[13.5px] text-muted transition-colors hover:bg-raised hover:text-danger"
          >
            <IconLogout className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
