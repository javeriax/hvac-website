'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import {
  IconArrowLeft,
  IconCalendar,
  IconCamera,
  IconCheck,
  IconClipboard,
  IconClock,
  IconDoc,
  IconMapPin,
  IconPhone,
  IconReceipt,
  IconSignature,
  IconTruck,
  IconUser,
  } from '@/components/icons';
import { ServiceMark } from '@/components/ServiceMark';
import { Alert, Avatar, Button, LinkButton, Modal, Pill, Skeleton, TextArea, useToasts } from '@/components/ui';
import { api } from '@/lib/api';
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
import { Job, Quotation, ServiceRequest } from '@/lib/types';

export default function CustomerRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: request, loading, error, reload } = useApi<ServiceRequest>(`/service-requests/${id}`);
  const { push, view } = useToasts();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const job = request?.job as Job | undefined;
  const quote = request?.quotation as Quotation | undefined;
  const tech = job?.technician as { name: string; phone?: string; avatarUrl?: string } | undefined;

  const cancellable = request && !['completed', 'cancelled', 'in_progress'].includes(request.status);

  const cancel = async () => {
    setBusy(true);
    try {
      await api.post(`/service-requests/${id}/cancel`, { reason });
      push('Request cancelled');
      setCancelOpen(false);
      await reload();
    } catch (err) {
      push(err instanceof Error ? err.message : 'Could not cancel', 'danger');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardShell
      roles={['customer']}
      title={request?.title ?? 'Service request'}
      subtitle={request ? `${request.trackingCode} · raised ${relative(request.createdAt)}` : undefined}
      actions={
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/customer/requests')}>
          <IconArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      }
    >
      {view}

      {loading && <Skeleton className="h-96" />}
      {error && <Alert tone="danger">{error}</Alert>}

      {request && (
        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5">
            {/* summary */}
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <ServiceMark type={request.serviceType} size={44} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={toneFor('request', request.status)}>{titleCase(request.status)}</Pill>
                      <Pill tone={toneFor('priority', request.priority)}>{titleCase(request.priority)}</Pill>
                      <span className="text-2xs text-muted">{serviceLabel(request.serviceType)}</span>
                    </div>
                    <h2 className="mt-2.5 text-[19px] font-semibold leading-snug">{request.title}</h2>
                  </div>
                </div>
                {cancellable && (
                  <Button variant="ghost" size="sm" onClick={() => setCancelOpen(true)}>
                    Cancel request
                  </Button>
                )}
              </div>

              <p className="mt-5 whitespace-pre-line text-[14px] leading-relaxed text-muted">
                {request.description}
              </p>

              <dl className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
                  <div>
                    <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Service address</dt>
                    <dd className="mt-1 text-[13.5px] leading-snug">{addressLine(request.address)}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <IconCalendar className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
                  <div>
                    <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Preferred window</dt>
                    <dd className="mt-1 text-[13.5px]">
                      {request.preferredDate ? fmtDate(request.preferredDate) : 'Any date'}
                      {request.preferredWindow && request.preferredWindow !== 'anytime'
                        ? ` · ${titleCase(request.preferredWindow)}`
                        : ''}
                    </dd>
                  </div>
                </div>
                {request.systemBrand && (
                  <div className="flex items-start gap-2.5">
                    <IconClipboard className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
                    <div>
                      <dt className="text-2xs uppercase tracking-[0.12em] text-faint">System</dt>
                      <dd className="mt-1 text-[13.5px]">
                        {request.systemBrand}
                        {request.systemAge ? ` · ${request.systemAge}` : ''}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>

              {request.photos?.length > 0 && (
                <div className="mt-6 border-t border-line pt-5">
                  <p className="mb-3 flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
                    <IconCamera className="h-3.5 w-3.5" />
                    Photos you attached
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {request.photos.map((p, i) => (
                      <a
                        key={p.url + i}
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="aspect-square overflow-hidden rounded-lg border border-line"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={p.caption ?? `Attachment ${i + 1}`} className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* completed report */}
            {job?.report && (
              <div className="rounded-card border border-ok/25 bg-ok/[0.03] p-5">
                <div className="flex items-center gap-2.5">
                  <IconCheck className="h-4.5 w-4.5 text-ok" />
                  <h2 className="text-[15px] font-semibold">Service report</h2>
                  <span className="tnum ml-auto text-2xs text-muted">
                    {fmtDateTime(job.report.submittedAt)}
                  </span>
                </div>

                <p className="mt-4 text-[14px] leading-relaxed">{job.report.summary}</p>

                <dl className="mt-5 space-y-4 border-t border-line pt-4 text-[13.5px]">
                  <div>
                    <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Work performed</dt>
                    <dd className="mt-1 leading-relaxed text-muted">{job.report.workPerformed}</dd>
                  </div>
                  {job.report.partsUsed?.length > 0 && (
                    <div>
                      <dt className="text-2xs uppercase tracking-[0.12em] text-faint">Parts used</dt>
                      <dd className="mt-1.5">
                        <ul className="space-y-1">
                          {job.report.partsUsed.map((p) => (
                            <li key={p.name} className="flex justify-between gap-3 text-muted">
                              <span>{p.name}</span>
                              <span className="tnum">×{p.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                  {job.report.recommendations && (
                    <div>
                      <dt className="text-2xs uppercase tracking-[0.12em] text-faint">
                        Technician recommendations
                      </dt>
                      <dd className="mt-1 leading-relaxed text-muted">{job.report.recommendations}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Labour hours</dt>
                    <dd className="tnum font-medium">{job.report.laborHours}h</dd>
                  </div>
                </dl>

                {job.signature && (
                  <p className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-2xs text-muted">
                    <IconSignature className="h-3.5 w-3.5 text-ok" />
                    Signed on site by {job.signature.signedBy} · {fmtDateTime(job.signature.signedAt)}
                  </p>
                )}
              </div>
            )}

            {/* before/after photos */}
            {job?.photos && job.photos.length > 0 && (
              <div className="rounded-card border border-line bg-surface p-5">
                <h2 className="text-[15px] font-semibold">Job photos</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  {(['before', 'after'] as const).map((phase) => {
                    const shots = job.photos.filter((p) => p.phase === phase);
                    if (!shots.length) return null;
                    return (
                      <div key={phase}>
                        <p className="mb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
                          {phase}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
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
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
            {quote && (
              <div className="rounded-card border border-line bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[15px] font-semibold">Quotation</h2>
                  <Pill tone={toneFor('quote', quote.status)}>{titleCase(quote.status)}</Pill>
                </div>
                <p className="tnum mt-3 text-[13px] text-muted">{quote.quoteNumber}</p>
                <p className="tnum mt-2 text-[28px] font-semibold leading-none">{money(quote.total)}</p>
                <p className="mt-2 text-2xs text-muted">Valid until {fmtDate(quote.validUntil)}</p>
                <LinkButton
                  href={`/dashboard/customer/quotations/${quote._id}`}
                  size="sm"
                  variant={quote.status === 'sent' ? 'primary' : 'ghost'}
                  className="mt-4 w-full"
                >
                  {quote.status === 'sent' ? 'Review & respond' : 'View quotation'}
                </LinkButton>
              </div>
            )}

            {job && (
              <div className="rounded-card border border-line bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[15px] font-semibold">Visit</h2>
                  <Pill tone={toneFor('job', job.status)}>{titleCase(job.status)}</Pill>
                </div>
                <p className="tnum mt-3 text-[13px] text-muted">{job.jobNumber}</p>

                <div className="mt-4 space-y-2.5 text-[13px]">
                  <p className="flex items-center gap-2 text-muted">
                    <IconClock className="h-3.5 w-3.5 text-frost" />
                    {fmtDateTime(job.scheduledStart)}
                  </p>
                  {job.completedAt && (
                    <p className="flex items-center gap-2 text-ok">
                      <IconCheck className="h-3.5 w-3.5" />
                      Completed {relative(job.completedAt)}
                    </p>
                  )}
                </div>

                {tech && (
                  <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                    <Avatar name={tech.name} src={tech.avatarUrl} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{tech.name}</p>
                      <p className="text-2xs text-muted">Your technician</p>
                    </div>
                    {tech.phone && (
                      <a
                        href={`tel:${tech.phone.replace(/\D/g, '')}`}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-frost transition-colors hover:bg-raised"
                        aria-label={`Call ${tech.name}`}
                      >
                        <IconPhone className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {!tech && (
                  <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[13px] text-muted">
                    <IconTruck className="h-3.5 w-3.5 text-faint" />
                    Technician not yet assigned
                  </p>
                )}
              </div>
            )}

            {job?.invoice && (
              <Link
                href={`/dashboard/customer/invoices/${typeof job.invoice === 'string' ? job.invoice : job.invoice._id}`}
                className="flex items-center gap-3 rounded-card border border-line bg-surface p-5 transition-colors hover:border-frost/30"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-sunken text-frost">
                  <IconReceipt className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium">Invoice issued</p>
                  <p className="text-2xs text-muted">View and settle online</p>
                </div>
                <IconDoc className="h-4 w-4 shrink-0 text-faint" />
              </Link>
            )}

            <div className="rounded-card border border-line bg-sunken p-5">
              <p className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.14em] text-faint">
                <IconUser className="h-3.5 w-3.5" />
                Contact on file
              </p>
              <div className="mt-3 space-y-1.5 text-[13px] text-muted">
                <p>{request.contact.name}</p>
                <p>{request.contact.email}</p>
                <p className="tnum">{request.contact.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this request?"
        subtitle="You can always raise a new one later."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setCancelOpen(false)}>
              Keep it
            </Button>
            <Button variant="ember" size="sm" onClick={cancel} loading={busy}>
              Cancel request
            </Button>
          </>
        }
      >
        <TextArea
          label="Reason (optional)"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Sorted itself out, going with another provider, bad timing…"
        />
      </Modal>
    </DashboardShell>
  );
}
