'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { InvoiceDocument } from '@/components/dashboard/InvoiceDocument';
import { IconArrowLeft, IconCard, IconCheck } from '@/components/icons';
import { Alert, Button, Modal, SelectField, Skeleton, TextField, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { cx, fmtDate, money } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Invoice, Payment } from '@/lib/types';

const METHODS = [
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'online', label: 'Online payment' },
];

export default function CustomerInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, loading, error, reload } = useApi<{ invoice: Invoice; payments: Payment[] }>(
    `/invoices/${id}`,
  );
  const { push, view } = useToasts();

  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [busy, setBusy] = useState(false);

  const invoice = data?.invoice;
  const payable = invoice && invoice.balance > 0 && invoice.status !== 'void';

  const openPay = () => {
    setAmount(invoice ? invoice.balance.toFixed(2) : '');
    setPayOpen(true);
  };

  const pay = async () => {
    setBusy(true);
    try {
      await api.post(`/invoices/${id}/payments`, {
        amount: Number(amount),
        method,
        reference: `PORTAL-${Date.now().toString(36).toUpperCase()}`,
      });
      push('Payment recorded, thank you');
      setPayOpen(false);
      await reload();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Payment could not be recorded', 'danger');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardShell
      roles={['customer']}
      title={invoice?.invoiceNumber ?? 'Invoice'}
      subtitle={invoice ? `${money(invoice.total)} · due ${fmtDate(invoice.dueDate)}` : undefined}
      actions={
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/customer/invoices')}>
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
          {payable && (
            <div
              className={cx(
                'flex flex-wrap items-center justify-between gap-4 rounded-card border px-5 py-4',
                invoice.status === 'overdue'
                  ? 'border-danger/35 bg-danger/[0.06]'
                  : 'border-ember/35 bg-ember/[0.05]',
              )}
            >
              <div>
                <p className="text-[14px] font-semibold">
                  {invoice.status === 'overdue' ? 'This invoice is overdue' : 'Balance outstanding'}
                </p>
                <p className="mt-0.5 text-[13px] text-muted">
                  {money(invoice.balance)} due by {fmtDate(invoice.dueDate)}.
                </p>
              </div>
              <Button size="sm" variant="ember" onClick={openPay}>
                <IconCard className="h-3.5 w-3.5" />
                Pay now
              </Button>
            </div>
          )}

          {invoice.status === 'paid' && (
            <Alert tone="ok" title="Paid in full">
              Settled on {fmtDate(invoice.paidAt)}. Thank you, the receipt is in the payment history
              below.
            </Alert>
          )}

          <InvoiceDocument invoice={invoice} payments={data?.payments ?? []} />
        </div>
      )}

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Make a payment"
        subtitle="Demonstration gateway, no card details are collected or stored."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={pay} loading={busy}>
              <IconCheck className="h-3.5 w-3.5" />
              Pay {amount ? money(Number(amount)) : ''}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-sunken p-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[13px] text-muted">Outstanding balance</span>
              <span className="tnum text-[21px] font-semibold text-ember">
                {invoice ? money(invoice.balance) : '—'}
              </span>
            </div>
          </div>

          <TextField
            type="number"
            step="0.01"
            min="0.01"
            max={invoice?.balance}
            label="Amount to pay"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hint="Partial payments are accepted."
          />

          <SelectField
            label="Payment method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            options={METHODS}
          />

          <p className="text-2xs leading-relaxed text-faint">
            This project implements the payment interface only, as permitted by the brief. No real
            gateway is connected and no card data is captured at any point.
          </p>
        </div>
      </Modal>
    </DashboardShell>
  );
}
