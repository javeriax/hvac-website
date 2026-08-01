'use client';

import { FormEvent, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { TechStatusToggle } from '@/components/dashboard/TechStatusToggle';
import { IconCheck, IconShield, IconStar } from '@/components/icons';
import { Avatar, Button, TextField, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { fmtDate } from '@/lib/format';
import { User } from '@/lib/types';

export default function TechnicianProfilePage() {
  const { user, setUser } = useAuth();
  const { push, view } = useToasts();
  const [saving, setSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
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
      setSaving(false);
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
    setSavingPw(true);
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
      setSavingPw(false);
    }
  };

  const tech = user?.technician;

  return (
    <DashboardShell
      roles={['technician']}
      title="Profile"
      subtitle="Your details, certifications and availability"
      actions={<TechStatusToggle />}
    >
      {view}

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <form onSubmit={saveProfile} className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-[15px] font-semibold">Contact details</h2>
            <p className="mt-1 text-[13px] text-muted">
              Customers see your name; dispatch uses your number to reach you on the road.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <TextField name="name" label="Full name" defaultValue={user?.name} required />
              <TextField name="phone" label="Phone" type="tel" defaultValue={user?.phone} />
              <TextField label="Email" defaultValue={user?.email} disabled wrapClass="sm:col-span-2" hint="Managed by your administrator" />
            </div>
            <div className="mt-6 flex justify-end border-t border-line pt-5">
              <Button type="submit" size="sm" loading={saving}>
                <IconCheck className="h-3.5 w-3.5" />
                Save changes
              </Button>
            </div>
          </form>

          <div className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-[15px] font-semibold">Employment record</h2>
            <p className="mt-1 text-[13px] text-muted">
              Skills, certifications and rates are maintained by an administrator.
            </p>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Employee ID</dt>
                <dd className="tnum mt-1.5 text-[14px] font-medium">{tech?.employeeId ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Shift</dt>
                <dd className="tnum mt-1.5 text-[14px] font-medium">
                  {tech?.shiftStart} – {tech?.shiftEnd}
                </dd>
              </div>
              <div>
                <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Hourly rate</dt>
                <dd className="tnum mt-1.5 text-[14px] font-medium">${tech?.hourlyRate}/hr</dd>
              </div>
              <div>
                <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Service areas</dt>
                <dd className="mt-1.5 text-[14px] font-medium">
                  {(tech?.serviceAreas ?? []).join(', ') || '—'}
                </dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-line pt-5">
              <p className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
                <IconShield className="h-3.5 w-3.5" />
                Certifications
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(tech?.certifications ?? []).map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-frost/20 bg-frost/[0.06] px-2.5 py-1 text-2xs text-frost"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">Skills</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(tech?.skills ?? []).map((s) => (
                  <span key={s} className="rounded-md bg-raised px-2.5 py-1 text-2xs text-muted">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={savePassword} className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-[15px] font-semibold">Change password</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <TextField name="currentPassword" type="password" label="Current" required autoComplete="current-password" />
              <TextField name="newPassword" type="password" label="New" required autoComplete="new-password" />
              <TextField name="confirm" type="password" label="Confirm" required autoComplete="new-password" error={pwError ?? undefined} />
            </div>
            <div className="mt-6 flex justify-end border-t border-line pt-5">
              <Button type="submit" size="sm" variant="ghost" loading={savingPw}>
                Update password
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-card border border-line bg-surface p-6 text-center">
            <div className="flex justify-center">
              <Avatar name={user?.name} src={user?.avatarUrl} size={64} tone="ember" />
            </div>
            <p className="mt-4 text-[15px] font-semibold">{user?.name}</p>
            <p className="text-[13px] text-muted">{user?.email}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5">
              <div>
                <p className="tnum flex items-center justify-center gap-1 text-[20px] font-semibold text-ember">
                  <IconStar className="h-4 w-4 fill-current" />
                  {(tech?.rating ?? 5).toFixed(1)}
                </p>
                <p className="mt-1 text-2xs text-muted">Rating</p>
              </div>
              <div>
                <p className="tnum text-[20px] font-semibold">{tech?.jobsCompleted ?? 0}</p>
                <p className="mt-1 text-2xs text-muted">Jobs completed</p>
              </div>
            </div>

            <p className="mt-5 border-t border-line pt-4 text-2xs uppercase tracking-[0.12em] text-faint">
              With ArcticAir since
            </p>
            <p className="tnum mt-1 text-[13.5px] font-medium">{fmtDate(user?.createdAt)}</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
