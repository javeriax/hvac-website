'use client';

import { FormEvent, useState } from 'react';
import { IconCheck, IconShield } from '@/components/icons';
import { Avatar, Button, TextField, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { fmtDate, titleCase } from '@/lib/format';
import { User } from '@/lib/types';

/**
 * Account screen for staff (dispatchers and admins).
 *
 * Customers and technicians have their own richer pages because they carry extra
 * detail like service addresses and certifications. Staff only need their contact
 * details and a way to change their own password, which nothing else offered
 * before this existed.
 */
export function AccountSettings() {
  const { user, setUser } = useAuth();
  const { push, view } = useToasts();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const saveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSavingProfile(true);
    try {
      const updated = await api.patch<User>('/auth/me', {
        name: fd.get('name'),
        phone: fd.get('phone'),
      });
      setUser(updated);
      push('Profile updated');
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not save', 'danger');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const next = String(fd.get('newPassword'));

    if (next !== String(fd.get('confirm'))) {
      setPwError('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: fd.get('currentPassword'),
        newPassword: next,
      });
      push('Password changed');
      form.reset();
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : 'Could not change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      {view}

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <form onSubmit={saveProfile} className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-[15px] font-semibold">Your details</h2>
            <p className="mt-1 text-[13px] text-muted">
              Your name appears on the quotations and invoices you create.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <TextField name="name" label="Full name" defaultValue={user?.name} required />
              <TextField name="phone" label="Phone" type="tel" defaultValue={user?.phone} />
              <TextField
                label="Email"
                defaultValue={user?.email}
                disabled
                wrapClass="sm:col-span-2"
                hint="Contact an administrator to change your sign-in email"
              />
            </div>

            <div className="mt-6 flex justify-end border-t border-line pt-5">
              <Button type="submit" size="sm" loading={savingProfile}>
                <IconCheck className="h-3.5 w-3.5" />
                Save changes
              </Button>
            </div>
          </form>

          <form onSubmit={savePassword} className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-[15px] font-semibold">Change password</h2>
            <p className="mt-1 text-[13px] text-muted">At least 8 characters.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <TextField
                name="currentPassword"
                type="password"
                label="Current"
                required
                autoComplete="current-password"
              />
              <TextField
                name="newPassword"
                type="password"
                label="New"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <TextField
                name="confirm"
                type="password"
                label="Confirm"
                required
                autoComplete="new-password"
                error={pwError ?? undefined}
              />
            </div>

            <div className="mt-6 flex justify-end border-t border-line pt-5">
              <Button type="submit" size="sm" variant="ghost" loading={savingPassword}>
                Update password
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-card border border-line bg-surface p-6 text-center">
            <div className="flex justify-center">
              <Avatar name={user?.name} src={user?.avatarUrl} size={64} />
            </div>
            <p className="mt-4 text-[15px] font-semibold">{user?.name}</p>
            <p className="text-[13px] text-muted">{user?.email}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-pill border border-line px-3 py-1 text-2xs font-semibold uppercase tracking-[0.12em]">
              <IconShield className="h-3 w-3 text-frost" />
              {titleCase(user?.role)}
            </p>
            <p className="mt-5 border-t border-line pt-4 text-2xs uppercase tracking-[0.12em] text-faint">
              With ArcticAir since
            </p>
            <p className="tnum mt-1 text-[13.5px] font-medium">{fmtDate(user?.createdAt)}</p>
          </div>

          <div className="rounded-card border border-line bg-sunken p-5">
            <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
              Account access
            </p>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
              Staff accounts are created by an administrator, never by signing up. If you need your
              role or permissions changed, ask an administrator to update your record.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
