'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { QuotationBuilder } from '@/components/dashboard/QuotationBuilder';
import { QuotationDocument } from '@/components/dashboard/QuotationDocument';
import {
  IconArrowLeft,
  IconCalendar,
  IconCamera,
  IconCheck,
  IconClipboard,
  IconDoc,
  IconMapPin,
  IconPhone,
  IconSend,
  IconTruck,
  IconUser,
} from '@/components/icons';
import {
  Alert,
  Avatar,
  Button,
  Modal,
  Pill,
  SelectField,
  Skeleton,
  TextArea,
  TextField,
  useToasts,
} from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import {
  addressLine,
  cx,
  fmtDate,
  fmtDateTime,
  money,
  relative,
  serviceLabel,
  titleCase,
  toneFor,
} from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Job, Quotation, ServiceRequest, User } from '@/lib/types';

const DURATIONS = [
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
  { value: '240', label: '4 hours' },
  { value: '480', label: 'Full day' },
];

export default function DispatcherRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: request, loading, error, reload } = useApi<ServiceRequest>(`/service-requests/${id}`);
  const { data: technicians } = useApi<User[]>('/users/technicians');
  const { push, view } = useToasts();

  const [quoteOpen, setQuoteOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const quote = request?.quotation as Quotation | undefined;
  const job = request?.job as Job | undefined;
  const customer = typeof request?.customer === 'object' ? (request.customer as User) : undefined;

  const sendQuote = async () => {
    if (!quote) return;
    setBusy(true);
    try {
      await api.post(`/quotations/${quote._id}/send`);
      push('Quotation sent to the customer');
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not send', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const scheduleJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api.post('/jobs', {
        serviceRequest: id,
        technician: fd.get('technician') || undefined,
        scheduledStart: new Date(String(fd.get('scheduledStart'))).toISOString(),
        durationMinutes: Number(fd.get('durationMinutes')),
      });
      push('Job scheduled');
      setScheduleOpen(false);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not schedule', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api.patch(`/service-requests/${id}/status`, {
        status: fd.get('status'),
        note: fd.get('note'),
      });
      push('Status updated');
      setStatusOpen(false);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not update', 'danger');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardShell
      roles={['dispatcher', 'admin']}
      title={request?.title ?? 'Service request'}
      subtitle={request ? `${request.trackingCode} · raised ${relative(request.createdAt)}` : undefined}
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

      {request && (
        <div className="space-y-5">
          {/* action bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={toneFor('request', request.status)}>{titleCase(request.status)}</Pill>
              <Pill tone={toneFor('priority', request.priority)}>{titleCase(request.priority)}</Pill>
              <span className="text-2xs text-muted">{serviceLabel(request.serviceType)}</span>
              <span className="text-2xs text-muted">· {titleCase(request.propertyType)}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStatusOpen(true)}>
                Update status
              </Button>

              {!quote && customer && (
                <Button size="sm" onClick={() => setQuoteOpen(true)}>
                  <IconDoc className="h-3.5 w-3.5" />
                  Build quotation
                </Button>
              )}
              {quote?.status === 'draft' && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setQuoteOpen(true)}>
                    Edit draft
                  </Button>
                  <Button size="sm" onClick={sendQuote} loading={busy}>
                    <IconSend className="h-3.5 w-3.5" />
                    Send quotation
                  </Button>
                </>
              )}
              {!job && (
                <Button
                  size="sm"
                  variant={quote?.status === 'accepted' ? 'primary' : 'ghost'}
                  onClick={() => setScheduleOpen(true)}
                >
                  <IconCalendar className="h-3.5 w-3.5" />
                  Schedule job
                </Button>
              )}
              {job && (
                <Link href={`/dashboard/technician/jobs/${job._id}`} className="btn-ghost btn-sm">
                  <IconTruck className="h-3.5 w-3.5" />
                  Open job
                </Link>
              )}
            </div>
          </div>

          {!customer && (
            <Alert tone="warn" title="Guest request, no linked account">
              This request came in without a customer account, so it cannot be quoted yet. Ask the
              customer to register with {request.contact.email}, or create the account from the admin
              customer list.
            </Alert>
          )}

          <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-5">
              {/* detail */}
              <div className="rounded-card border border-line bg-surface p-5">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                  <IconClipboard className="h-4 w-4 text-frost" />
                  Reported issue
                </h2>
                <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-muted">
                  {request.description}
                </p>

                <dl className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Service address</dt>
                    <dd className="mt-1 flex items-start gap-2 text-[13.5px] leading-snug">
                      <IconMapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
                      {addressLine(request.address)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Preferred window</dt>
                    <dd className="mt-1 text-[13.5px]">
                      {request.preferredDate ? fmtDate(request.preferredDate) : 'Any date'}
                      {request.preferredWindow && request.preferredWindow !== 'anytime'
                        ? ` · ${titleCase(request.preferredWindow)}`
                        : ''}
                    </dd>
                  </div>
                  {request.systemBrand && (
                    <div>
                      <dt className="text-2xs uppercase tracking-[0.12em] text-faint">System</dt>
                      <dd className="mt-1 text-[13.5px]">
                        {request.systemBrand} · {request.systemAge}
                      </dd>
                    </div>
                  )}
                </dl>

                {request.photos?.length > 0 && (
                  <div className="mt-5 border-t border-line pt-5">
                    <p className="mb-2.5 flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
                      <IconCamera className="h-3.5 w-3.5" />
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
                          <img src={p.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {quote && <QuotationDocument quote={quote} />}

              {/* timeline */}
              <div className="rounded-card border border-line bg-surface p-5">
                <h2 className="text-[15px] font-semibold">Activity</h2>
                <ol className="relative mt-5 space-y-5 border-l border-line pl-6">
                  {[...request.timeline].reverse().map((t, i) => (
                    <li key={`${t.status}-${t.at}-${i}`} className="relative">
                      <span
                        className={cx(
                          'absolute -left-[1.79rem] top-1 h-2.5 w-2.5 rounded-full border-2 bg-surface',
                          i === 0 ? 'border-frost' : 'border-line',
                        )}
                      />
                      <p className="text-[13.5px] font-medium">{titleCase(t.status)}</p>
                      {t.note && <p className="mt-0.5 text-[13px] text-muted">{t.note}</p>}
                      <p className="tnum mt-1 text-2xs text-faint">{fmtDateTime(t.at)}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* right rail */}
            <div className="space-y-4">
              <div className="rounded-card border border-line bg-surface p-5">
                <p className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
                  <IconUser className="h-3.5 w-3.5" />
                  Customer
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name={customer?.name ?? request.contact.name} src={customer?.avatarUrl} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">
                      {customer?.name ?? request.contact.name}
                    </p>
                    <p className="truncate text-2xs text-muted">
                      {customer ? titleCase(customer.customer?.propertyType ?? '') : 'Guest'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-line pt-3 text-[13px] text-muted">
                  <p className="truncate">{request.contact.email}</p>
                  <a
                    href={`tel:${request.contact.phone.replace(/\D/g, '')}`}
                    className="tnum flex items-center gap-2 text-frost hover:opacity-80"
                  >
                    <IconPhone className="h-3.5 w-3.5" />
                    {request.contact.phone}
                  </a>
                </div>

                {customer && (
                  <Link
                    href={`/dashboard/admin/customers/${customer._id}`}
                    className="btn-ghost btn-sm mt-4 w-full"
                  >
                    Open customer record
                  </Link>
                )}
              </div>

              {quote && (
                <div className="rounded-card border border-line bg-surface p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
                      Quotation
                    </p>
                    <Pill tone={toneFor('quote', quote.status)}>{titleCase(quote.status)}</Pill>
                  </div>
                  <p className="tnum mt-3 text-[13px] text-muted">{quote.quoteNumber}</p>
                  <p className="tnum mt-1.5 text-[26px] font-semibold leading-none">
                    {money(quote.total)}
                  </p>
                  <p className="mt-2 text-2xs text-muted">Valid until {fmtDate(quote.validUntil)}</p>
                  {quote.rejectionReason && (
                    <p className="mt-3 rounded-lg border border-danger/25 bg-danger/[0.05] p-2.5 text-2xs text-muted">
                      {quote.rejectionReason}
                    </p>
                  )}
                </div>
              )}

              {job && (
                <div className="rounded-card border border-line bg-surface p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
                      Scheduled job
                    </p>
                    <Pill tone={toneFor('job', job.status)}>{titleCase(job.status)}</Pill>
                  </div>
                  <p className="tnum mt-3 text-[13.5px] font-medium">{job.jobNumber}</p>
                  <p className="tnum mt-2 text-[13px] text-muted">{fmtDateTime(job.scheduledStart)}</p>
                  {typeof job.technician === 'object' && (
                    <div className="mt-4 flex items-center gap-3 border-t border-line pt-3">
                      <Avatar name={(job.technician as User).name} size={32} />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">
                          {(job.technician as User).name}
                        </p>
                        <p className="text-2xs text-muted">Assigned</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------- modals --------------------------------- */}
      <QuotationBuilder
        request={request}
        existing={quote?.status === 'draft' ? quote : null}
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        onSaved={() => {
          push('Quotation saved');
          void reload();
        }}
      />

      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule this job"
        subtitle="Leave the technician blank to park it in the unassigned queue."
      >
        <form onSubmit={scheduleJob} className="space-y-4">
          <TextField
            name="scheduledStart"
            type="datetime-local"
            label="Start"
            required
            defaultValue={(() => {
              const d = request?.preferredDate ? new Date(request.preferredDate) : new Date();
              d.setHours(9, 0, 0, 0);
              d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
              return d.toISOString().slice(0, 16);
            })()}
          />
          <SelectField
            name="durationMinutes"
            label="Expected duration"
            defaultValue="120"
            options={DURATIONS}
          />
          <SelectField
            name="technician"
            label="Technician"
            placeholder="Leave unassigned"
            options={(technicians ?? []).map((t) => ({
              value: t._id,
              label: `${t.name} · ${titleCase(t.technician?.status)} · ${t.jobsToday ?? 0} today`,
            }))}
          />

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={busy}>
              <IconCheck className="h-3.5 w-3.5" />
              Schedule
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="Update request status">
        <form onSubmit={updateStatus} className="space-y-4">
          <SelectField
            name="status"
            label="New status"
            defaultValue={request?.status}
            options={[
              { value: 'submitted', label: 'Submitted' },
              { value: 'reviewing', label: 'Reviewing' },
              { value: 'quoted', label: 'Quoted' },
              { value: 'approved', label: 'Approved' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <TextArea
            name="note"
            label="Note for the customer"
            rows={3}
            placeholder="Called to confirm access details; scheduling for Thursday morning."
          />
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setStatusOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={busy}>
              Update
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
