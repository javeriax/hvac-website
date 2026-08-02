'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconCheck, IconClock, IconStar, IconTruck } from '@/components/icons';
import { Alert, Avatar, Button, Dot, Modal, SelectField, TextField } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { cx, fmtDateTime, titleCase, toneFor } from '@/lib/format';
import { Job, User } from '@/lib/types';

const DURATIONS = [
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
  { value: '240', label: '4 hours' },
  { value: '360', label: '6 hours' },
  { value: '480', label: 'Full day (8 hours)' },
];

function toLocalInput(date: string | Date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/**
 * Assign-a-technician dialog, opened from the dispatch board.
 *
 * Lists each technician with their skills, rating and how many jobs they already
 * have today so the dispatcher is not picking blind. The ordering is only a
 * hint. The real double-booking check runs on the server and can still reject.
 */
export function AssignTechnicianModal({
  job,
  open,
  onClose,
  onDone,
}: {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [start, setStart] = useState('');
  const [duration, setDuration] = useState('120');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSelected(typeof job?.technician === 'object' ? (job.technician as User)._id : '');
    setStart(job ? toLocalInput(job.scheduledStart) : '');
    const mins = job
      ? Math.round((+new Date(job.scheduledEnd) - +new Date(job.scheduledStart)) / 60000)
      : 120;
    setDuration(String(DURATIONS.some((d) => d.value === String(mins)) ? mins : 120));

    api
      .get<User[]>('/users/technicians')
      .then(setTechnicians)
      .catch(() => setTechnicians([]));
  }, [open, job]);

  // Rank technicians by whether their skills match the job's service type.
  const ranked = useMemo(() => {
    if (!job) return technicians;
    const type = job.serviceType.replace('-', ' ');
    return [...technicians].sort((a, b) => {
      const score = (t: User) => {
        const skills = (t.technician?.skills ?? []).join(' ').toLowerCase();
        const areaMatch = (t.technician?.serviceAreas ?? []).includes(job.address.city) ? 2 : 0;
        const skillMatch = skills.includes(type) ? 3 : 0;
        const availability = t.technician?.status === 'available' ? 1 : 0;
        const load = -(t.jobsToday ?? 0) * 0.4;
        return areaMatch + skillMatch + availability + load;
      };
      return score(b) - score(a);
    });
  }, [technicians, job]);

  const assign = async () => {
    if (!job || !selected) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/jobs/${job._id}/assign`, {
        technician: selected,
        scheduledStart: new Date(start).toISOString(),
        durationMinutes: Number(duration),
      });
      onDone();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not assign this job');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="Assign a technician"
      subtitle={job ? `${job.jobNumber} · ${job.title}` : undefined}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={assign} loading={busy} disabled={!selected}>
            <IconCheck className="h-3.5 w-3.5" />
            Assign &amp; schedule
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <Alert tone="danger">{error}</Alert>}

        {job && (
          <div className="rounded-xl border border-line bg-sunken p-4 text-[13px]">
            <div className="flex flex-wrap justify-between gap-3">
              <span className="text-muted">Site</span>
              <span className="font-medium">
                {job.address.city}, {job.address.state}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-3">
              <span className="text-muted">Currently scheduled</span>
              <span className="tnum font-medium">{fmtDateTime(job.scheduledStart)}</span>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            type="datetime-local"
            label="Start time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <SelectField
            label="Expected duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            options={DURATIONS}
          />
        </div>

        <div>
          <span className="label">Technician</span>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {ranked.map((t) => {
              const on = selected === t._id;
              const areaMatch = (t.technician?.serviceAreas ?? []).includes(job?.address.city ?? '');
              return (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => setSelected(t._id)}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                    on ? 'border-frost/50 bg-frost/[0.06]' : 'border-line bg-sunken hover:border-frost/25',
                  )}
                >
                  <Avatar name={t.name} src={t.avatarUrl} size={38} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13.5px] font-medium">{t.name}</p>
                      <Dot tone={toneFor('tech', t.technician?.status)} />
                      <span className="text-2xs text-muted">{titleCase(t.technician?.status)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-2xs text-muted">
                      {(t.technician?.skills ?? []).slice(0, 3).join(' · ')}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2.5 text-2xs text-faint">
                      <span className="tnum flex items-center gap-1">
                        <IconStar className="h-3 w-3 text-ember" />
                        {(t.technician?.rating ?? 5).toFixed(1)}
                      </span>
                      <span className="tnum flex items-center gap-1">
                        <IconTruck className="h-3 w-3" />
                        {t.jobsToday ?? 0} today
                      </span>
                      <span className="tnum flex items-center gap-1">
                        <IconClock className="h-3 w-3" />
                        {t.technician?.shiftStart}–{t.technician?.shiftEnd}
                      </span>
                      {areaMatch && (
                        <span className="rounded bg-frost/12 px-1.5 py-0.5 text-frost">
                          covers {job?.address.city}
                        </span>
                      )}
                    </div>
                  </div>

                  {on && <IconCheck className="h-4 w-4 shrink-0 text-frost" />}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-2xs text-faint">
            Ordered by skill match, coverage area, availability and today&apos;s load. Double-bookings
            are rejected by the server.
          </p>
        </div>
      </div>
    </Modal>
  );
}
