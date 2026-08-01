'use client';

import { FormEvent, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { IconCheck, IconUser } from '@/components/icons';
import { Avatar, Button, SelectField, TextField, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { fmtDate } from '@/lib/format';
import { SERVICE_AREAS } from '@/lib/site';
import { User } from '@/lib/types';

export default function CustomerProfilePage() {
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
        propertyType: fd.get('propertyType'),
        companyName: fd.get('companyName'),
        preferredContact: fd.get('preferredContact'),
        address: {
          line1: fd.get('line1'),
          line2: fd.get('line2'),
          city: fd.get('city'),
          state: fd.get('state'),
          zip: fd.get('zip'),
        },
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
    <DashboardShell roles={['customer']} title="Profile" subtitle="Contact details and service address">
      {view}

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <form onSubmit={saveProfile} className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-[15px] font-semibold">Account details</h2>
            <p className="mt-1 text-[13px] text-muted">
              We use this to contact you about visits and to route technicians.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <TextField name="name" label="Full name" defaultValue={user?.name} required />
              <TextField name="phone" label="Phone" type="tel" defaultValue={user?.phone} />
              <SelectField
                name="propertyType"
                label="Property type"
                defaultValue={user?.customer?.propertyType ?? 'residential'}
                options={[
                  { value: 'residential', label: 'Residential' },
                  { value: 'commercial', label: 'Commercial' },
                ]}
              />
              <SelectField
                name="preferredContact"
                label="Preferred contact"
                defaultValue={user?.customer?.preferredContact ?? 'email'}
                options={[
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Phone call' },
                  { value: 'sms', label: 'Text message' },
                ]}
              />
              <TextField
                name="companyName"
                label="Company name"
                defaultValue={user?.customer?.companyName}
                wrapClass="sm:col-span-2"
                hint="Commercial accounts only"
              />
            </div>

            <h3 className="mt-8 text-[14px] font-semibold">Service address</h3>
            <div className="mt-4 space-y-4">
              <TextField name="line1" label="Street address" defaultValue={user?.customer?.address.line1} required />
              <TextField name="line2" label="Apartment, suite, unit" defaultValue={user?.customer?.address.line2} />
              <div className="grid gap-4 sm:grid-cols-3">
                <SelectField
                  name="city"
                  label="City"
                  defaultValue={user?.customer?.address.city}
                  options={SERVICE_AREAS.map((a) => ({ value: a.city, label: a.city }))}
                />
                <TextField name="state" label="State" defaultValue={user?.customer?.address.state ?? 'AZ'} />
                <TextField name="zip" label="ZIP" defaultValue={user?.customer?.address.zip} />
              </div>
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
                label="Current password"
                required
                autoComplete="current-password"
              />
              <TextField
                name="newPassword"
                type="password"
                label="New password"
                required
                autoComplete="new-password"
              />
              <TextField
                name="confirm"
                type="password"
                label="Confirm new"
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
            <p className="mt-4 border-t border-line pt-4 text-2xs uppercase tracking-[0.12em] text-faint">
              Customer since
            </p>
            <p className="tnum mt-1 text-[13.5px] font-medium">
              {fmtDate(user?.customer?.customerSince ?? user?.createdAt)}
            </p>
          </div>

          <div className="rounded-card border border-line bg-sunken p-5">
            <p className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
              <IconUser className="h-3.5 w-3.5" />
              Why we ask
            </p>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
              The service address determines which depot covers you and how quickly a technician can
              reach you in an emergency. Keeping it current matters more than it looks.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
