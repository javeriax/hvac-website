'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { QuotationDocument } from '@/components/dashboard/QuotationDocument';
import { IconArrowLeft, IconCheck, IconClock, IconX } from '@/components/icons';
import { Alert, Button, Modal, Skeleton, TextArea, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { fmtDate, money } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Quotation } from '@/lib/types';

export default function CustomerQuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: quote, loading, error, reload } = useApi<Quotation>(`/quotations/${id}`);
  const { push, view } = useToasts();

  const [confirm, setConfirm] = useState<'accept' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const respond = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await api.post(`/quotations/${id}/respond`, { decision: confirm, reason });
      push(confirm === 'accept' ? 'Quotation approved — we will schedule you shortly' : 'Quotation declined');
      setConfirm(null);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not record your decision', 'danger');
    } finally {
      setBusy(false);
    }
  };

  const actionable = quote?.status === 'sent' && new Date(quote.validUntil).getTime() > Date.now();
  const daysLeft = quote
    ? Math.ceil((new Date(quote.validUntil).getTime() - Date.now()) / 86400000)
    : 0;

  return (
    <DashboardShell
      roles={['customer']}
      title={quote?.quoteNumber ?? 'Quotation'}
      subtitle={quote ? `${money(quote.total)} · valid until ${fmtDate(quote.validUntil)}` : undefined}
      actions={
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/customer/quotations')}>
          <IconArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      }
    >
      {view}

      {loading && <Skeleton className="h-[36rem]" />}
      {error && <Alert tone="danger">{error}</Alert>}

      {quote && (
        <div className="space-y-5">
          {actionable && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-frost/35 bg-frost/[0.05] px-5 py-4">
              <div className="flex items-start gap-3">
                <IconClock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-frost" />
                <div>
                  <p className="text-[14px] font-semibold">This quotation is awaiting your decision</p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {daysLeft > 0
                      ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left to respond.`
                      : 'Expires today.'}{' '}
                    Approving schedules a technician; nothing is charged yet.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setConfirm('reject')}>
                  <IconX className="h-3.5 w-3.5" />
                  Decline
                </Button>
                <Button size="sm" onClick={() => setConfirm('accept')}>
                  <IconCheck className="h-3.5 w-3.5" />
                  Approve {money(quote.total)}
                </Button>
              </div>
            </div>
          )}

          {quote.status === 'accepted' && (
            <Alert tone="ok" title="You approved this quotation">
              A dispatcher is scheduling a technician against your preferred window. You will be
              notified as soon as the visit is booked.
            </Alert>
          )}
          {quote.status === 'rejected' && (
            <Alert tone="warn" title="You declined this quotation">
              Nothing is scheduled. If circumstances change, raise a new request and we will re-quote.
            </Alert>
          )}
          {quote.status === 'expired' && (
            <Alert tone="warn" title="This quotation has expired">
              Pricing on parts moves, so estimates lapse after 30 days. Raise a new request for a
              fresh quote.
            </Alert>
          )}

          <QuotationDocument quote={quote} />
        </div>
      )}

      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === 'accept' ? 'Approve this quotation?' : 'Decline this quotation?'}
        subtitle={
          confirm === 'accept'
            ? 'We will schedule a technician and confirm the arrival window.'
            : 'Nothing will be scheduled. Telling us why genuinely helps.'
        }
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={confirm === 'accept' ? 'primary' : 'ember'}
              onClick={respond}
              loading={busy}
            >
              {confirm === 'accept' ? 'Yes, approve' : 'Yes, decline'}
            </Button>
          </>
        }
      >
        {confirm === 'accept' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-sunken p-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[13px] text-muted">Total approved</span>
                <span className="tnum text-[21px] font-semibold text-frost">
                  {quote ? money(quote.total) : '—'}
                </span>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-muted">
              Approving does not take payment. You will receive an invoice after the work is
              completed and signed off.
            </p>
          </div>
        ) : (
          <TextArea
            label="Reason (optional)"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Above budget, going with another contractor, deferring to next season…"
          />
        )}
      </Modal>
    </DashboardShell>
  );
}
