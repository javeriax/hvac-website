'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { InvoiceDocument } from '@/components/dashboard/InvoiceDocument';
import { IconArrowLeft, IconCard, IconCheck, IconSend, IconX } from '@/components/icons';
import { Alert, Button, Modal, SelectField, Skeleton, TextField, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { fmtDate, money } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Invoice, Payment } from '@/lib/types';

const METHODS = [
  { value: 'card', label: 'Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'online', label: 'Online payment' },
];

export default function AdminInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, loading, error, reload } = useApi<{ invoice: Invoice; payments: Payment[] }>(
    `/invoices/${id}`,
  );
  const { push, view } = useToasts();

  const [payOpen, setPayOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const invoice = data?.invoice;

  const act = async (fn: () => Promise<unknown>, okMessage: string) => {
    setBusy(true);
    try {
      await fn();
      push(okMessage);
      await reload();
      return true;
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'That did not work', 'danger');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const recordPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const ok = await act(
      () =>
        api.post(`/invoices/${id}/payments`, {
          amount: Number(fd.get('amount')),
          method: fd.get('method'),
          reference: fd.get('reference'),
        }),
      'Payment recorded',
    );
    if (ok) setPayOpen(false);
  };

  return (
    <DashboardShell
      roles={['admin']}
      title={invoice?.invoiceNumber ?? 'Invoice'}
      subtitle={invoice ? `${money(invoice.total)} · due ${fmtDate(invoice.dueDate)}` : undefined}
      actions={
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin/invoices')}>
          <IconArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      }
    >
      {view}

      {loading && <Skeleton className="h-[36rem]" />}
      {error && <Alert tone="danger">{error}</Alert>}

      {invoice && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface px-5 py-4">
            <div>
              <p className="text-[14px] font-semibold">
                {invoice.status === 'draft'
                  ? 'This invoice has not been issued yet'
                  : invoice.balance > 0
                    ? `${money(invoice.balance)} outstanding`
                    : 'Settled in full'}
              </p>
              <p className="mt-0.5 text-[13px] text-muted">
                {invoice.status === 'draft'
                  ? 'The customer cannot see it until you issue it.'
                  : `Issued ${fmtDate(invoice.issueDate)} · due ${fmtDate(invoice.dueDate)}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {invoice.status === 'draft' && (
                <Button
                  size="sm"
                  loading={busy}
                  onClick={() => act(() => api.post(`/invoices/${id}/send`), 'Invoice issued')}
                >
                  <IconSend className="h-3.5 w-3.5" />
                  Issue invoice
                </Button>
              )}
              {invoice.balance > 0 && invoice.status !== 'void' && (
                <Button size="sm" variant="ember" onClick={() => setPayOpen(true)}>
                  <IconCard className="h-3.5 w-3.5" />
                  Record payment
                </Button>
              )}
              {invoice.amountPaid === 0 && invoice.status !== 'void' && (
                <Button size="sm" variant="ghost" onClick={() => setVoidOpen(true)}>
                  <IconX className="h-3.5 w-3.5" />
                  Void
                </Button>
              )}
            </div>
          </div>

          {invoice.status === 'void' && (
            <Alert tone="warn" title="This invoice has been voided">
              It no longer counts toward outstanding balances or revenue.
            </Alert>
          )}

          <InvoiceDocument invoice={invoice} payments={data?.payments ?? []} />
        </div>
      )}

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Record a payment"
        subtitle="Use this for cash, cheques and transfers received off-platform."
      >
        <form onSubmit={recordPayment} className="space-y-4">
          <div className="rounded-xl border border-line bg-sunken p-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[13px] text-muted">Outstanding balance</span>
              <span className="tnum text-[21px] font-semibold text-ember">
                {invoice ? money(invoice.balance) : '—'}
              </span>
            </div>
          </div>

          <TextField
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={invoice?.balance}
            label="Amount received"
            required
            defaultValue={invoice?.balance.toFixed(2)}
          />
          <SelectField name="method" label="Method" defaultValue="card" options={METHODS} />
          <TextField
            name="reference"
            label="Reference"
            placeholder="Cheque number, transaction ID…"
          />

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={busy}>
              <IconCheck className="h-3.5 w-3.5" />
              Record payment
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={voidOpen}
        onClose={() => setVoidOpen(false)}
        title="Void this invoice?"
        subtitle="It stays on the record but stops counting toward revenue or balances."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setVoidOpen(false)}>
              Keep it
            </Button>
            <Button
              size="sm"
              variant="ember"
              loading={busy}
              onClick={async () => {
                const ok = await act(() => api.post(`/invoices/${id}/void`), 'Invoice voided');
                if (ok) setVoidOpen(false);
              }}
            >
              Void invoice
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-muted">
          Only invoices with no recorded payments can be voided. If money has already been taken,
          issue a refund against the payment instead.
        </p>
      </Modal>
    </DashboardShell>
  );
}
