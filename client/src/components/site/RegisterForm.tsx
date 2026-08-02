'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthShell } from './AuthShell';
import { Alert, Button, SelectField, TextField } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { HOME_FOR, useAuth } from '@/lib/auth';
import { cx } from '@/lib/format';
import { SERVICE_AREAS } from '@/lib/site';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('residential');
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setErrors({});

    const fd = new FormData(e.currentTarget);
    const password = String(fd.get('password') ?? '');
    const confirm = String(fd.get('confirm') ?? '');

    const next: Record<string, string> = {};
    if (password.length < 8) next.password = 'Use at least 8 characters';
    if (password !== confirm) next.confirm = 'Passwords do not match';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setBusy(true);
    try {
      const user = await register({
        name: String(fd.get('name')),
        email: String(fd.get('email')),
        password,
        phone: String(fd.get('phone') ?? ''),
        propertyType,
        companyName: propertyType === 'commercial' ? String(fd.get('companyName') ?? '') : undefined,
        address: {
          line1: String(fd.get('line1') ?? ''),
          line2: String(fd.get('line2') ?? '') || undefined,
          city: String(fd.get('city') ?? ''),
          state: String(fd.get('state') ?? 'AZ'),
          zip: String(fd.get('zip') ?? ''),
        },
      });
      router.replace(HOME_FOR[user.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create your account');
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Keep every reading, photo and invoice."
      lede="A customer account turns each visit into a permanent record, useful when you sell the house, dispute a warranty claim, or just want to know what was actually done."
      points={[
        'Full service history with technician reports',
        'Approve quotations without phone tag',
        'Invoices, balances and payment history',
        'Enrol in a maintenance plan and manage renewals',
      ]}
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="link-underline text-frost">
            Sign in
          </Link>
        </>
      }
    >
      <h2 className="text-[21px] font-semibold">Create your account</h2>
      <p className="mt-1.5 text-[13.5px] text-muted">
        Takes under a minute. Existing requests raised with the same email link automatically.
      </p>

      {error && (
        <div className="mt-5">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <span className="label">Property type</span>
          <div className="flex gap-2">
            {(['residential', 'commercial'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPropertyType(t)}
                className={cx(
                  'flex-1 rounded-xl border px-4 py-2.5 text-[13.5px] font-medium capitalize transition-colors',
                  propertyType === t
                    ? 'border-frost/50 bg-frost/[0.06] text-frost'
                    : 'border-line bg-sunken text-muted hover:text-ink',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <TextField name="name" label="Full name" required autoComplete="name" placeholder="Alex Rivera" />

        {propertyType === 'commercial' && (
          <TextField
            name="companyName"
            label="Company name"
            placeholder="Desert Ridge Dental Group"
            autoComplete="organization"
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="email"
            type="email"
            label="Email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <TextField
            name="phone"
            type="tel"
            label="Phone"
            autoComplete="tel"
            placeholder="(602) 555-0142"
          />
        </div>

        <TextField
          name="line1"
          label="Service address"
          required
          autoComplete="address-line1"
          placeholder="4820 N Camelback Ridge Rd"
        />
        <TextField
          name="line2"
          label="Apartment, suite, unit"
          autoComplete="address-line2"
          placeholder="Unit 12"
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            name="city"
            label="City"
            required
            placeholder="Select"
            options={SERVICE_AREAS.map((a) => ({ value: a.city, label: a.city }))}
          />
          <TextField name="state" label="State" defaultValue="AZ" />
          <TextField name="zip" label="ZIP" required inputMode="numeric" placeholder="85251" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="password"
            type="password"
            label="Password"
            required
            autoComplete="new-password"
            error={errors.password}
            hint={errors.password ? undefined : 'At least 8 characters'}
            placeholder="••••••••"
          />
          <TextField
            name="confirm"
            type="password"
            label="Confirm password"
            required
            autoComplete="new-password"
            error={errors.confirm}
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" loading={busy} className="w-full">
          {busy ? 'Creating account' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  );
}
