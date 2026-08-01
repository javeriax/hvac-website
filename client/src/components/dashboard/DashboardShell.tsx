'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { Logo } from '@/components/brand';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  IconCalendar,
  IconChart,
  IconClipboard,
  IconDoc,
  IconGrid,
  IconLogout,
  IconMail,
  IconMenu,
  IconReceipt,
  IconSettings,
  IconShield,
  IconTruck,
  IconUser,
  IconUsers,
  IconWrench,
  IconX,
} from '@/components/icons';
import { Avatar, Spinner } from '@/components/ui';
import { HOME_FOR, useAuth } from '@/lib/auth';
import { cx, titleCase } from '@/lib/format';
import { Role } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: (p: { className?: string }) => JSX.Element;
  exact?: boolean;
}

const NAV: Record<Role, { section: string; items: NavItem[] }[]> = {
  customer: [
    {
      section: 'My account',
      items: [
        { href: '/dashboard/customer', label: 'Overview', icon: IconGrid, exact: true },
        { href: '/dashboard/customer/requests', label: 'Service requests', icon: IconClipboard },
        { href: '/dashboard/customer/quotations', label: 'Quotations', icon: IconDoc },
        { href: '/dashboard/customer/invoices', label: 'Invoices', icon: IconReceipt },
        { href: '/dashboard/customer/contracts', label: 'Maintenance plan', icon: IconShield },
      ],
    },
    {
      section: 'Settings',
      items: [{ href: '/dashboard/customer/profile', label: 'Profile', icon: IconUser }],
    },
  ],
  technician: [
    {
      section: 'Field work',
      items: [
        { href: '/dashboard/technician', label: 'Today', icon: IconGrid, exact: true },
        { href: '/dashboard/technician/schedule', label: 'My schedule', icon: IconCalendar },
        { href: '/dashboard/technician/history', label: 'Completed', icon: IconClipboard },
      ],
    },
    {
      section: 'Settings',
      items: [{ href: '/dashboard/technician/profile', label: 'Profile', icon: IconUser }],
    },
  ],
  dispatcher: [
    {
      section: 'Dispatch',
      items: [
        { href: '/dashboard/dispatcher', label: 'Board', icon: IconGrid, exact: true },
        { href: '/dashboard/dispatcher/schedule', label: 'Calendar', icon: IconCalendar },
        { href: '/dashboard/dispatcher/requests', label: 'Requests', icon: IconClipboard },
        { href: '/dashboard/dispatcher/technicians', label: 'Technicians', icon: IconTruck },
      ],
    },
    {
      section: 'Sales',
      items: [{ href: '/dashboard/dispatcher/quotations', label: 'Quotations', icon: IconDoc }],
    },
  ],
  admin: [
    {
      section: 'Overview',
      items: [
        { href: '/dashboard/admin', label: 'Analytics', icon: IconChart, exact: true },
        { href: '/dashboard/admin/requests', label: 'Service requests', icon: IconClipboard },
      ],
    },
    {
      section: 'Revenue',
      items: [
        { href: '/dashboard/admin/quotations', label: 'Quotations', icon: IconDoc },
        { href: '/dashboard/admin/invoices', label: 'Invoices', icon: IconReceipt },
        { href: '/dashboard/admin/contracts', label: 'Contracts', icon: IconShield },
      ],
    },
    {
      section: 'Operations',
      items: [
        { href: '/dashboard/admin/customers', label: 'Customers', icon: IconUsers },
        { href: '/dashboard/admin/technicians', label: 'Technicians', icon: IconTruck },
        { href: '/dashboard/admin/equipment', label: 'Equipment', icon: IconWrench },
        { href: '/dashboard/admin/plans', label: 'Plans', icon: IconSettings },
        { href: '/dashboard/admin/messages', label: 'Messages', icon: IconMail },
      ],
    },
  ],
};

const ROLE_TONE: Record<Role, string> = {
  customer: 'text-frost',
  technician: 'text-warn',
  dispatcher: 'text-info',
  admin: 'text-ember',
};

export function DashboardShell({
  roles,
  title,
  subtitle,
  actions,
  children,
}: {
  roles: Role[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (!roles.includes(user.role)) {
      router.replace(HOME_FOR[user.role]);
    }
  }, [loading, user, roles, router, pathname]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (loading || !user || !roles.includes(user.role)) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex items-center gap-3 text-muted">
          <Spinner />
          <span className="text-[13.5px]">Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  const sections = NAV[user.role];

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
        <Logo size={26} href={HOME_FOR[user.role]} />
        <button
          onClick={() => setMobileOpen(false)}
          className="text-muted lg:hidden"
          aria-label="Close navigation"
        >
          <IconX className="h-4.5 w-4.5" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.section}>
            <p className="mb-2 px-3 text-2xs font-semibold uppercase tracking-[0.16em] text-faint">
              {section.section}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cx(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors',
                        active ? 'bg-raised text-ink' : 'text-muted hover:bg-raised/60 hover:text-ink',
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-thermal" />
                      )}
                      <item.icon
                        className={cx('h-4 w-4 shrink-0', active ? 'text-frost' : 'text-faint')}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user.name} src={user.avatarUrl} size={34} />
          <div className="min-w-0 flex-1">
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
          <button
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-danger"
            aria-label="Sign out"
            title="Sign out"
          >
            <IconLogout className="h-4 w-4" />
          </button>
        </div>
        <Link
          href="/"
          className="mt-1 block rounded-lg px-3 py-2 text-2xs uppercase tracking-[0.12em] text-faint transition-colors hover:text-frost"
        >
          ← Back to website
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[16.5rem] shrink-0 border-r border-line bg-surface lg:block">
        {sidebar}
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[16.5rem] animate-fade-in border-r border-line bg-surface">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-40 border-b border-line">
          <div className="flex min-h-16 items-center gap-4 px-5 py-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line lg:hidden"
              aria-label="Open navigation"
            >
              <IconMenu className="h-4.5 w-4.5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[17px] font-semibold leading-tight">{title}</h1>
              {subtitle && <p className="mt-0.5 truncate text-[12.5px] text-muted">{subtitle}</p>}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {actions}
              <NotificationBell />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
