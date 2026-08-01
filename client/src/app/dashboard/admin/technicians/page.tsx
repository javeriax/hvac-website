'use client';

import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StatTile } from '@/components/charts';
import {
  IconClock,
  IconMapPin,
  IconPhone,
  IconPlus,
  IconSettings,
  IconStar,
  IconTruck,
  IconUsers,
} from '@/components/icons';
import {
  Avatar,
  Button,
  Dot,
  Meter,
  Modal,
  SelectField,
  Skeleton,
  TextField,
  useToasts,
} from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { cx, money, titleCase, toneFor } from '@/lib/format';
import { SERVICE_AREAS } from '@/lib/site';
import { useApi } from '@/lib/useApi';
import { User } from '@/lib/types';

export default function AdminTechniciansPage() {
  const { data, loading, reload } = useApi<User[]>('/users/technicians');
  const { push, view } = useToasts();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  const stats = useMemo(() => {
    const rows = data ?? [];
    return {
      total: rows.length,
      available: rows.filter((t) => t.technician?.status === 'available').length,
      jobs: rows.reduce((a, t) => a + (t.technician?.jobsCompleted ?? 0), 0),
      avgRating: rows.length
        ? rows.reduce((a, t) => a + (t.technician?.rating ?? 5), 0) / rows.length
        : 5,
    };
  }, [data]);

  const createTechnician = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api.post('/users', {
        name: fd.get('name'),
        email: fd.get('email'),
        password: fd.get('password'),
        phone: fd.get('phone'),
        role: 'technician',
        technician: {
          employeeId: fd.get('employeeId'),
          hourlyRate: Number(fd.get('hourlyRate')),
          shiftStart: fd.get('shiftStart'),
          shiftEnd: fd.get('shiftEnd'),
          skills: String(fd.get('skills') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
          certifications: String(fd.get('certifications') ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          serviceAreas: fd.getAll('serviceAreas').map(String),
        },
      });
      push('Technician account created');
      setCreateOpen(false);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not create the account', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const updateTechnician = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api.patch(`/users/${editing._id}`, {
        name: fd.get('name'),
        phone: fd.get('phone'),
        isActive: fd.get('isActive') === 'true',
        technician: {
          hourlyRate: Number(fd.get('hourlyRate')),
          shiftStart: fd.get('shiftStart'),
          shiftEnd: fd.get('shiftEnd'),
          status: fd.get('status'),
          skills: String(fd.get('skills') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
          certifications: String(fd.get('certifications') ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          serviceAreas: fd.getAll('serviceAreas').map(String),
        },
      });
      push('Technician updated');
      setEditing(null);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not save', 'danger');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardShell
      roles={['admin']}
      title="Technicians"
      subtitle="Roster, skills, rates and availability"
      actions={
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <IconPlus className="h-3.5 w-3.5" />
          Add technician
        </Button>
      }
    >
      {view}

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="On the roster" value={stats.total} icon={<IconUsers className="h-4 w-4" />} />
          <StatTile
            label="Available now"
            value={stats.available}
            icon={<IconTruck className="h-4 w-4" />}
            tone="ok"
          />
          <StatTile
            label="Lifetime jobs"
            value={stats.jobs}
            icon={<IconClock className="h-4 w-4" />}
            tone="frost"
            hint="Completed across the team"
          />
          <StatTile
            label="Average rating"
            value={stats.avgRating.toFixed(1)}
            icon={<IconStar className="h-4 w-4" />}
            tone="ember"
          />
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(data ?? []).map((tech) => {
              const t = tech.technician;
              return (
                <div
                  key={tech._id}
                  className={cx(
                    'rounded-card border bg-surface p-5',
                    tech.isActive ? 'border-line' : 'border-line opacity-60',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={tech.name} src={tech.avatarUrl} size={44} tone="ember" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold">{tech.name}</p>
                      <p className="tnum text-2xs text-muted">
                        {t?.employeeId} · {money(t?.hourlyRate ?? 0, { cents: false })}/hr
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-2xs">
                        <Dot tone={toneFor('tech', t?.status)} />
                        <span className="text-muted">{titleCase(t?.status)}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setEditing(tech)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-frost"
                      aria-label={`Edit ${tech.name}`}
                    >
                      <IconSettings className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
                    <div>
                      <p className="tnum flex items-center gap-1 text-[17px] font-semibold text-ember">
                        <IconStar className="h-3.5 w-3.5 fill-current" />
                        {(t?.rating ?? 5).toFixed(1)}
                      </p>
                      <p className="text-2xs text-muted">Rating</p>
                    </div>
                    <div>
                      <p className="tnum text-[17px] font-semibold">{t?.jobsCompleted ?? 0}</p>
                      <p className="text-2xs text-muted">Jobs completed</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-baseline justify-between text-2xs">
                      <span className="text-faint">Today&apos;s load</span>
                      <span className="tnum font-semibold">{tech.jobsToday ?? 0} / 6</span>
                    </div>
                    <Meter
                      value={tech.jobsToday ?? 0}
                      max={6}
                      tone={(tech.jobsToday ?? 0) >= 5 ? 'danger' : 'ok'}
                    />
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-line pt-3.5 text-2xs text-muted">
                    <p className="flex items-center gap-2">
                      <IconClock className="h-3 w-3 shrink-0 text-faint" />
                      <span className="tnum">
                        {t?.shiftStart} – {t?.shiftEnd}
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <IconMapPin className="mt-0.5 h-3 w-3 shrink-0 text-faint" />
                      <span>{(t?.serviceAreas ?? []).join(', ') || '—'}</span>
                    </p>
                    {tech.phone && (
                      <p className="tnum flex items-center gap-2">
                        <IconPhone className="h-3 w-3 shrink-0 text-faint" />
                        {tech.phone}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
                    {(t?.certifications ?? []).map((c) => (
                      <span
                        key={c}
                        className="rounded border border-frost/20 bg-frost/[0.06] px-1.5 py-0.5 text-2xs text-frost"
                      >
                        {c}
                      </span>
                    ))}
                    {(t?.skills ?? []).map((s) => (
                      <span key={s} className="rounded bg-raised px-1.5 py-0.5 text-2xs text-muted">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add a technician" wide>
        <form onSubmit={createTechnician} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="name" label="Full name" required />
            <TextField name="email" type="email" label="Work email" required />
            <TextField name="phone" label="Phone" type="tel" />
            <TextField name="employeeId" label="Employee ID" placeholder="AA-T007" />
            <TextField name="password" type="password" label="Temporary password" required minLength={8} />
            <TextField name="hourlyRate" type="number" label="Hourly rate ($)" defaultValue={90} />
            <TextField name="shiftStart" label="Shift start" defaultValue="08:00" />
            <TextField name="shiftEnd" label="Shift end" defaultValue="17:00" />
          </div>
          <TextField
            name="skills"
            label="Skills"
            placeholder="Installation, Diagnostics, Heat Pumps"
            hint="Comma separated"
          />
          <TextField
            name="certifications"
            label="Certifications"
            placeholder="NATE Certified, EPA 608 Universal"
            hint="Comma separated"
          />
          <div>
            <span className="label">Service areas</span>
            <div className="flex flex-wrap gap-2">
              {SERVICE_AREAS.map((a) => (
                <label
                  key={a.city}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-sunken px-3 py-1.5 text-[13px] transition-colors hover:border-frost/30"
                >
                  <input type="checkbox" name="serviceAreas" value={a.city} className="accent-current" />
                  {a.city}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={busy}>
              Create technician
            </Button>
          </div>
        </form>
      </Modal>

      {/* edit */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.name ?? ''}`}
        wide
      >
        {editing && (
          <form onSubmit={updateTechnician} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="name" label="Full name" defaultValue={editing.name} required />
              <TextField name="phone" label="Phone" defaultValue={editing.phone} />
              <SelectField
                name="status"
                label="Availability"
                defaultValue={editing.technician?.status}
                options={[
                  { value: 'available', label: 'Available' },
                  { value: 'on_job', label: 'On a job' },
                  { value: 'off_duty', label: 'Off duty' },
                  { value: 'on_leave', label: 'On leave' },
                ]}
              />
              <SelectField
                name="isActive"
                label="Account"
                defaultValue={String(editing.isActive)}
                options={[
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Deactivated' },
                ]}
              />
              <TextField
                name="hourlyRate"
                type="number"
                label="Hourly rate ($)"
                defaultValue={editing.technician?.hourlyRate}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField name="shiftStart" label="Shift start" defaultValue={editing.technician?.shiftStart} />
                <TextField name="shiftEnd" label="Shift end" defaultValue={editing.technician?.shiftEnd} />
              </div>
            </div>

            <TextField
              name="skills"
              label="Skills"
              defaultValue={(editing.technician?.skills ?? []).join(', ')}
              hint="Comma separated"
            />
            <TextField
              name="certifications"
              label="Certifications"
              defaultValue={(editing.technician?.certifications ?? []).join(', ')}
              hint="Comma separated"
            />

            <div>
              <span className="label">Service areas</span>
              <div className="flex flex-wrap gap-2">
                {SERVICE_AREAS.map((a) => (
                  <label
                    key={a.city}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-sunken px-3 py-1.5 text-[13px] transition-colors hover:border-frost/30"
                  >
                    <input
                      type="checkbox"
                      name="serviceAreas"
                      value={a.city}
                      defaultChecked={(editing.technician?.serviceAreas ?? []).includes(a.city)}
                    />
                    {a.city}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" loading={busy}>
                Save changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardShell>
  );
}
