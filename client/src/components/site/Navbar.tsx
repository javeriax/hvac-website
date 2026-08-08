'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/brand';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/site/UserMenu';
import { IconGrid, IconMenu, IconPhone, IconX } from '@/components/icons';
import { HOME_FOR, SETTINGS_FOR, useAuth } from '@/lib/auth';
import { cx } from '@/lib/format';
import { COMPANY, SITE_NAV } from '@/lib/site';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* Emergency strip, the one thing a panicking visitor needs. */}
      <div className="relative z-50 border-b border-line bg-sunken">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-1.5 text-2xs">
          <p className="flex items-center gap-2 text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-ember" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
            </span>
            <span className="uppercase tracking-[0.16em]">24/7 emergency dispatch</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono tracking-[0.1em] text-faint sm:inline">{COMPANY.license}</span>
            <a
              href={`tel:${COMPANY.emergencyPhone.replace(/\D/g, '')}`}
              className="flex items-center gap-1.5 font-mono font-semibold tracking-[0.06em] text-ember transition-opacity hover:opacity-80"
            >
              <IconPhone className="h-3 w-3" />
              {COMPANY.emergencyPhone}
            </a>
          </div>
        </div>
      </div>

      <header
        className={cx(
          'sticky top-0 z-50 border-b transition-all duration-300',
          scrolled ? 'glass border-line' : 'border-transparent bg-transparent',
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-3.5">
          <Logo />

          <div className="ml-auto hidden items-center gap-1 lg:flex">
            {SITE_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    'relative rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors',
                    active ? 'text-ink' : 'text-muted hover:text-ink',
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-px bg-thermal" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <ThemeToggle />

            <Link
              href="/track"
              className="hidden rounded-lg px-3 py-2 font-mono text-2xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-frost sm:block"
            >
              Track request
            </Link>

            {!user && (
              <Link href="/login" className="btn-ghost btn-sm hidden sm:inline-flex">
                Sign in
              </Link>
            )}

            {/* Signing in now leaves you on the public site, so the way into the
                dashboard has to be visible here rather than inside a dropdown. */}
            {user && (
              <Link href={HOME_FOR[user.role]} className="btn-ghost btn-sm hidden sm:inline-flex">
                <IconGrid className="h-3.5 w-3.5" />
                My dashboard
              </Link>
            )}

            <Link href="/request-quote" className="btn-primary btn-sm hidden md:inline-flex">
              Request a quote
            </Link>

            {/* Account sits last so it anchors the far right, past the CTA. */}
            {user && <UserMenu />}

            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink lg:hidden"
              aria-label="Toggle navigation"
              aria-expanded={open}
            >
              {open ? <IconX className="h-4.5 w-4.5" /> : <IconMenu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="animate-fade-in border-t border-line bg-surface lg:hidden">
            <div className="mx-auto grid max-w-7xl gap-1 px-5 py-4">
              {SITE_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-raised hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/track"
                className="rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-raised hover:text-ink"
              >
                Track a request
              </Link>
              {/* Signed-in users get their account links here instead of a
                  pointless "Sign in" button. */}
              {user && (
                <>
                  <span className="mt-2 px-3 text-2xs uppercase tracking-[0.14em] text-faint">
                    {user.name}
                  </span>
                  <Link
                    href={HOME_FOR[user.role]}
                    className="rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-raised hover:text-ink"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={SETTINGS_FOR[user.role]}
                    className="rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-raised hover:text-ink"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="rounded-lg px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-raised hover:text-danger"
                  >
                    Log out
                  </button>
                </>
              )}

              <div className="mt-2 grid grid-cols-2 gap-2">
                {!user && (
                  <Link href="/login" className="btn-ghost btn-sm">
                    Sign in
                  </Link>
                )}
                <Link
                  href="/request-quote"
                  className={user ? 'btn-primary btn-sm col-span-2' : 'btn-primary btn-sm'}
                >
                  Request a quote
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
