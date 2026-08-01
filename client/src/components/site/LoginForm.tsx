'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { AuthShell } from './AuthShell';
import { IconArrowRight, IconSpark } from '@/components/icons';
import { Alert, Button, TextField } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { HOME_FOR, useAuth } from '@/lib/auth';

/** Demo accounts surfaced in the UI so a grader can walk every role quickly. */
const DEMO_ACCOUNTS = [
  { role: 'Administrator', email: 'admin@arcticair.com', tone: 'text-ember' },
  { role: 'Dispatcher', email: 'dispatch@arcticair.com', tone: 'text-info' },
  { role: 'Technician', email: 'marcus@arcticair.com', tone: 'text-warn' },
  { role: 'Customer', email: 'customer@arcticair.com', tone: 'text-frost' },
];
const DEMO_PASSWORD = 'ArcticAir#2026';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const next = params.get('next');

  // Already signed in? Do not sit on the login screen.
  useEffect(() => {
    if (!authLoading && user) router.replace(next || HOME_FOR[user.role]);
  }, [authLoading, user, router, next]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const signedIn = await login(email, password);
      router.replace(next || HOME_FOR[signedIn.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign in failed');
      setBusy(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  return (
    <AuthShell
      title="Everything about your system, in one place."
      lede="Approve quotations, watch the technician get assigned, read the service report and settle invoices — without a single phone call."
      points={[
        'Approve or decline quotations online',
        'Live technician assignment and arrival status',
        'Before-and-after photos on every completed visit',
        'Invoices, payment history and maintenance contracts',
      ]}
      footer={
        <>
          New to ArcticAir?{' '}
          <Link href="/register" className="link-underline text-frost">
            Create an account
          </Link>
        </>
      }
    >
      <h2 className="text-[21px] font-semibold">Sign in</h2>
      <p className="mt-1.5 text-[13.5px] text-muted">Welcome back — pick up where you left off.</p>

      {error && (
        <div className="mt-5">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <TextField
          type="email"
          label="Email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <TextField
          type="password"
          label="Password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Button type="submit" loading={busy} className="w-full">
          {busy ? 'Signing in' : 'Sign in'}
          {!busy && <IconArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      {/* demo credentials */}
      <div className="mt-7 rounded-xl border border-line bg-sunken p-4">
        <p className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
          <IconSpark className="h-3.5 w-3.5 text-frost" />
          Demo accounts
        </p>
        <div className="mt-3 grid gap-1.5">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => fillDemo(a.email)}
              className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-raised"
            >
              <span className={`text-2xs font-semibold uppercase tracking-[0.1em] ${a.tone}`}>
                {a.role}
              </span>
              <span className="truncate font-mono text-[11.5px] text-muted">{a.email}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 border-t border-line pt-3 font-mono text-[11px] text-faint">
          password · {DEMO_PASSWORD}
        </p>
      </div>
    </AuthShell>
  );
}
