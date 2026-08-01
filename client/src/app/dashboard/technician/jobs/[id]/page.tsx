'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { SignaturePad } from '@/components/dashboard/SignaturePad';
import {
  IconArrowLeft,
  IconCamera,
  IconCheck,
  IconClipboard,
  IconClock,
  IconExternal,
  IconMapPin,
  IconPhone,
  IconPlay,
  IconPlus,
  IconSignature,
  IconTruck,
  IconUser,
  IconX,
} from '@/components/icons';
import {
  Alert,
  Avatar,
  Button,
  Modal,
  Pill,
  Skeleton,
  TextArea,
  TextField,
  useToasts,
} from '@/components/ui';
import { API_BASE, ApiError, api, tokenStore } from '@/lib/api';
import {
  addressLine,
  cx,
  fmtDateTime,
  fmtTime,
  serviceLabel,
  titleCase,
  toneFor,
} from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Job, JobStatus, ServiceRequest, User } from '@/lib/types';

/** Allowed forward transitions from the field. */
const NEXT_STATUS: Partial<Record<JobStatus, { to: JobStatus; label: string; icon: typeof IconPlay }[]>> = {
  assigned: [{ to: 'en_route', label: 'Start driving', icon: IconTruck }],
  en_route: [{ to: 'in_progress', label: 'Arrived — start work', icon: IconPlay }],
  in_progress: [
    { to: 'completed', label: 'Complete job', icon: IconCheck },
    { to: 'on_hold', label: 'Put on hold', icon: IconClock },
  ],
  on_hold: [{ to: 'in_progress', label: 'Resume work', icon: IconPlay }],
};

export default function TechnicianJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: job, loading, error, reload } = useApi<Job>(`/jobs/${id}`);
  const { push, view } = useToasts();

  const [busy, setBusy] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<'before' | 'after'>('before');
  const fileRef = useRef<HTMLInputElement>(null);

  const customer = job?.customer as User | undefined;
  const request = job?.serviceRequest as ServiceRequest | undefined;
  const transitions = job ? (NEXT_STATUS[job.status] ?? []) : [];
  const doneCount = job?.checklist.filter((c) => c.done).length ?? 0;

  const setStatus = async (status: JobStatus) => {
    setBusy(true);
    try {
      await api.patch(`/jobs/${id}/status`, { status });
      push(`Job marked ${titleCase(status).toLowerCase()}`);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not update status', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const toggleChecklist = async (index: number, done: boolean) => {
    try {
      await api.patch(`/jobs/${id}/checklist`, { index, done });
      await reload();
    } catch {
      push('Could not update the checklist', 'danger');
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setBusy(true);
    try {
      await api.post(`/jobs/${id}/notes`, { text: note });
      setNote('');
      setNoteOpen(false);
      push('Note added');
      await reload();
    } catch {
      push('Could not add the note', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const uploadPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append('photos', f));
    fd.append('phase', uploadPhase);

    try {
      const token = tokenStore.get();
      const res = await fetch(`${API_BASE}/jobs/${id}/photos?folder=jobs`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const payload = await res.json();
      if (!res.ok) throw new ApiError(res.status, payload.message ?? 'Upload failed');
      push(`${files.length} ${uploadPhase} photo(s) uploaded`);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Upload failed', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const submitReport = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api.post(`/jobs/${id}/report`, {
        summary: fd.get('summary'),
        workPerformed: fd.get('workPerformed'),
        recommendations: fd.get('recommendations'),
        laborHours: Number(fd.get('laborHours')),
        partsUsed: String(fd.get('partsUsed') ?? '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const m = line.match(/^(.*?)\s*[x×]\s*(\d+)$/i);
            return m ? { name: m[1].trim(), quantity: Number(m[2]) } : { name: line, quantity: 1 };
          }),
      });
      setReportOpen(false);
      push('Service report submitted');
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not submit the report', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const captureSignature = async (dataUrl: string, signedBy: string) => {
    setBusy(true);
    try {
      await api.post(`/jobs/${id}/signature`, { dataUrl, signedBy });
      setSignOpen(false);
      push('Signature captured');
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not save the signature', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const mapsHref = job
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine(job.address))}`
    : '#';

  return (
    <DashboardShell
      roles={['technician', 'dispatcher', 'admin']}
      title={job?.title ?? 'Job'}
      subtitle={job ? `${job.jobNumber} · ${fmtDateTime(job.scheduledStart)}` : undefined}
      actions={
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <IconArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      }
    >
      {view}

      {loading && <Skeleton className="h-96" />}
      {error && <Alert tone="danger">{error}</Alert>}

      {job && (
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-5">
            {/* status + actions */}
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={toneFor('job', job.status)}>{titleCase(job.status)}</Pill>
                    <Pill tone={toneFor('priority', job.priority)}>{titleCase(job.priority)}</Pill>
                    <span className="text-2xs text-muted">{serviceLabel(job.serviceType)}</span>
                  </div>
                  <h2 className="mt-3 text-[19px] font-semibold leading-snug">{job.title}</h2>
                  <p className="tnum mt-1 text-[13px] text-muted">
                    {fmtTime(job.scheduledStart)} – {fmtTime(job.scheduledEnd)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {transitions.map((t) => (
                    <Button
                      key={t.to}
                      size="sm"
                      variant={t.to === 'completed' ? 'primary' : t.to === 'on_hold' ? 'ghost' : 'ember'}
                      onClick={() => setStatus(t.to)}
                      loading={busy}
                    >
                      <t.icon className="h-3.5 w-3.5" />
                      {t.label}
                    </Button>
                  ))}
                </div>
              </div>

              {job.status === 'in_progress' && !job.report && (
                <div className="mt-5">
                  <Alert tone="info" title="Submit the service report before closing">
                    The system will not let a job be completed without a written report — it is what
                    the customer sees and what the invoice is built from.
                  </Alert>
                </div>
              )}

              {/* address + customer */}
              <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-2xs uppercase tracking-[0.12em] text-faint">Site</p>
                  <p className="mt-1.5 flex items-start gap-2 text-[13.5px] leading-snug">
                    <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-frost" />
                    {addressLine(job.address)}
                  </p>
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-2xs uppercase tracking-[0.1em] text-frost hover:opacity-80"
                  >
                    <IconExternal className="h-3 w-3" />
                    Navigate
                  </a>
                </div>

                <div>
                  <p className="text-2xs uppercase tracking-[0.12em] text-faint">Customer</p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <Avatar name={customer?.name} src={customer?.avatarUrl} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{customer?.name}</p>
                      <p className="tnum truncate text-2xs text-muted">{customer?.phone}</p>
                    </div>
                    {customer?.phone && (
                      <a
                        href={`tel:${customer.phone.replace(/\D/g, '')}`}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-frost transition-colors hover:bg-raised"
                        aria-label="Call customer"
                      >
                        <IconPhone className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* reported issue */}
            {request && (
              <div className="rounded-card border border-line bg-surface p-5">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                  <IconClipboard className="h-4 w-4 text-frost" />
                  Reported issue
                </h2>
                <p className="tnum mt-1 text-2xs text-muted">{request.trackingCode}</p>
                <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-muted">
                  {request.description}
                </p>

                {request.photos?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-2xs uppercase tracking-[0.12em] text-faint">
                      Customer photos
                    </p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {request.photos.map((p, i) => (
                        <a
                          key={p.url + i}
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-square overflow-hidden rounded-lg border border-line"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.url} alt={`Customer photo ${i + 1}`} className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* checklist */}
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold">Work checklist</h2>
                <span className="tnum text-2xs text-muted">
                  {doneCount} / {job.checklist.length}
                </span>
              </div>

              {job.checklist.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted">
                  No checklist attached to this job type.
                </p>
              ) : (
                <ul className="mt-4 space-y-1">
                  {job.checklist.map((item, i) => (
                    <li key={item.label}>
                      <label
                        className={cx(
                          'flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-raised',
                          job.status === 'completed' && 'pointer-events-none opacity-70',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={(e) => toggleChecklist(i, e.target.checked)}
                          className="peer sr-only"
                        />
                        <span
                          className={cx(
                            'mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded border transition-colors',
                            item.done ? 'border-ok bg-ok/15 text-ok' : 'border-line',
                          )}
                        >
                          {item.done && <IconCheck className="h-3 w-3" />}
                        </span>
                        <span
                          className={cx(
                            'text-[13.5px] leading-snug',
                            item.done ? 'text-faint line-through' : 'text-muted',
                          )}
                        >
                          {item.label}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* photos */}
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                  <IconCamera className="h-4 w-4 text-frost" />
                  Before &amp; after
                </h2>
                <div className="flex gap-2">
                  {(['before', 'after'] as const).map((phase) => (
                    <Button
                      key={phase}
                      size="xs"
                      variant="ghost"
                      loading={busy && uploadPhase === phase}
                      onClick={() => {
                        setUploadPhase(phase);
                        fileRef.current?.click();
                      }}
                    >
                      <IconPlus className="h-3 w-3" />
                      {phase}
                    </Button>
                  ))}
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  void uploadPhotos(e.target.files);
                  e.target.value = '';
                }}
              />

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {(['before', 'after'] as const).map((phase) => {
                  const shots = job.photos.filter((p) => p.phase === phase);
                  return (
                    <div key={phase}>
                      <p className="mb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
                        {phase} ({shots.length})
                      </p>
                      {shots.length === 0 ? (
                        <div className="grid h-24 place-items-center rounded-lg border border-dashed border-line text-2xs text-faint">
                          None yet
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {shots.map((p, i) => (
                            <a
                              key={p.url + i}
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="aspect-square overflow-hidden rounded-lg border border-line"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.url} alt={`${phase} ${i + 1}`} className="h-full w-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* notes */}
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold">Service notes</h2>
                <Button size="xs" variant="ghost" onClick={() => setNoteOpen(true)}>
                  <IconPlus className="h-3 w-3" />
                  Add note
                </Button>
              </div>

              {job.notes.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted">No notes on this job yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {job.notes
                    .slice()
                    .reverse()
                    .map((n, i) => (
                      <li key={`${n.at}-${i}`} className="rounded-lg border border-line bg-sunken p-3.5">
                        <p className="text-[13.5px] leading-relaxed">{n.text}</p>
                        <p className="tnum mt-1.5 text-2xs text-faint">{fmtDateTime(n.at)}</p>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          {/* right rail */}
          <div className="space-y-4">
            {/* report */}
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold">Service report</h2>
                {job.report ? (
                  <Pill tone="ok">Submitted</Pill>
                ) : (
                  <Pill tone="warn">Required</Pill>
                )}
              </div>

              {job.report ? (
                <>
                  <p className="mt-3 text-[13.5px] leading-relaxed">{job.report.summary}</p>
                  <dl className="mt-4 space-y-2 border-t border-line pt-3 text-[13px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Labour hours</dt>
                      <dd className="tnum font-medium">{job.report.laborHours}h</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Parts used</dt>
                      <dd className="tnum font-medium">{job.report.partsUsed?.length ?? 0}</dd>
                    </div>
                  </dl>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-4 w-full"
                    onClick={() => setReportOpen(true)}
                  >
                    Revise report
                  </Button>
                </>
              ) : (
                <>
                  <p className="mt-3 text-[13px] leading-relaxed text-muted">
                    Record what you found and what you did. This is what the customer reads and what
                    the invoice is built from.
                  </p>
                  <Button size="sm" className="mt-4 w-full" onClick={() => setReportOpen(true)}>
                    Write report
                  </Button>
                </>
              )}
            </div>

            {/* signature */}
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                  <IconSignature className="h-4 w-4 text-frost" />
                  Customer sign-off
                </h2>
                {job.signature && <Pill tone="ok">Signed</Pill>}
              </div>

              {job.signature ? (
                <>
                  <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={job.signature.url} alt="Customer signature" className="h-20 w-full object-contain" />
                  </div>
                  <p className="mt-2.5 text-2xs text-muted">
                    {job.signature.signedBy} · {fmtDateTime(job.signature.signedAt)}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-[13px] leading-relaxed text-muted">
                    Capture the customer&apos;s signature on the device before you leave site.
                  </p>
                  <Button size="sm" variant="ghost" className="mt-4 w-full" onClick={() => setSignOpen(true)}>
                    Capture signature
                  </Button>
                </>
              )}
            </div>

            {/* timeline */}
            <div className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-[15px] font-semibold">Job timeline</h2>
              <ol className="relative mt-4 space-y-4 border-l border-line pl-5">
                {[...job.timeline].reverse().map((t, i) => (
                  <li key={`${t.status}-${t.at}-${i}`} className="relative">
                    <span
                      className={cx(
                        'absolute -left-[1.6rem] top-1 h-2 w-2 rounded-full border-2 bg-surface',
                        i === 0 ? 'border-frost' : 'border-line',
                      )}
                    />
                    <p className="text-[13px] font-medium">{titleCase(t.status)}</p>
                    {t.note && <p className="mt-0.5 text-2xs text-muted">{t.note}</p>}
                    <p className="tnum mt-0.5 text-2xs text-faint">{fmtDateTime(t.at)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------- modals --------------------------------- */}
      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Add a service note"
        subtitle="Visible to dispatch, admin and the customer's record."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setNoteOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={addNote} loading={busy}>
              Add note
            </Button>
          </>
        }
      >
        <TextArea
          label="Note"
          rows={5}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Measured 18°F superheat, charge low but no visible leak. Recommended follow-up dye test."
        />
      </Modal>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Service report"
        subtitle="This is what the customer sees and what the invoice is built from."
        wide
      >
        <form onSubmit={submitReport} className="space-y-4">
          <TextField
            name="summary"
            label="Summary"
            required
            defaultValue={job?.report?.summary}
            placeholder="Failed run capacitor replaced, system operating within spec."
          />
          <TextArea
            name="workPerformed"
            label="Work performed"
            required
            rows={4}
            defaultValue={job?.report?.workPerformed}
            placeholder="Isolated power, confirmed capacitor reading 28 µF against 45 µF rating, replaced with OEM part, verified amp draw across a full cycle."
          />
          <TextArea
            name="partsUsed"
            label="Parts used"
            rows={3}
            defaultValue={job?.report?.partsUsed?.map((p) => `${p.name} x${p.quantity}`).join('\n')}
            hint="One per line. Add a quantity with “x2”."
            placeholder={'Dual Run Capacitor 45/5 MFD 440V x1\nR-410A Refrigerant (per lb) x3'}
          />
          <TextArea
            name="recommendations"
            label="Recommendations"
            rows={3}
            defaultValue={job?.report?.recommendations}
            placeholder="Contactor pitting is advanced — worth quoting a replacement before next summer."
          />
          <TextField
            name="laborHours"
            type="number"
            step="0.25"
            min="0.25"
            label="Labour hours on site"
            required
            defaultValue={job?.report?.laborHours ?? 1}
          />

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={busy}>
              <IconCheck className="h-3.5 w-3.5" />
              Submit report
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        title="Customer sign-off"
        subtitle="Hand the device over and have the customer sign to confirm the work."
      >
        <SignaturePad onCapture={captureSignature} busy={busy} defaultName={customer?.name} />
      </Modal>
    </DashboardShell>
  );
}
