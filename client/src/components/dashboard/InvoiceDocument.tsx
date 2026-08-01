'use client';

import { Logo } from '@/components/brand';
import { IconPrint } from '@/components/icons';
import { Meter, Pill } from '@/components/ui';
import { addressLine, fmtDate, money, titleCase, toneFor } from '@/lib/format';
import { COMPANY } from '@/lib/site';
import { Invoice, Job, LineItem, Payment, User } from '@/lib/types';

const KIND_LABEL: Record<LineItem['kind'], string> = {
  labor: 'Labour',
  equipment: 'Equipment',
  part: 'Part',
  fee: 'Fee',
};

/** Print-ready invoice with the payment ledger attached. */
export function InvoiceDocument({
  invoice,
  payments = [],
}: {
  invoice: Invoice;
  payments?: Payment[];
}) {
  const customer = typeof invoice.customer === 'object' ? (invoice.customer as User) : undefined;
  const job = typeof invoice.job === 'object' ? (invoice.job as Job) : undefined;
  const overdue = invoice.status === 'overdue';

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      <div className="relative border-b border-line px-7 py-6">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-thermal" />
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <Logo size={30} href={null} />
            <p className="mt-3 max-w-[16rem] text-2xs leading-relaxed text-muted">
              {COMPANY.address}
              <br />
              {COMPANY.phone} · {COMPANY.email}
              <br />
              {COMPANY.license}
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xs uppercase tracking-[0.18em] text-faint">Invoice</p>
            <p className="tnum mt-1 text-[21px] font-semibold">{invoice.invoiceNumber}</p>
            <div className="mt-2.5 flex justify-end">
              <Pill tone={toneFor('invoice', invoice.status)}>{titleCase(invoice.status)}</Pill>
            </div>
            <button
              onClick={() => window.print()}
              className="no-print mt-3 inline-flex items-center gap-1.5 text-2xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-frost"
            >
              <IconPrint className="h-3.5 w-3.5" />
              Print / save PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 border-b border-line px-7 py-6 sm:grid-cols-3">
        <div>
          <p className="text-2xs uppercase tracking-[0.14em] text-faint">Billed to</p>
          <p className="mt-2 text-[14px] font-semibold">{customer?.name ?? '—'}</p>
          {customer?.customer?.companyName && (
            <p className="text-[13px] text-muted">{customer.customer.companyName}</p>
          )}
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            {addressLine(customer?.customer?.address)}
          </p>
        </div>

        <div>
          <p className="text-2xs uppercase tracking-[0.14em] text-faint">Work reference</p>
          {job ? (
            <>
              <p className="tnum mt-2 text-[13.5px] font-medium">{job.jobNumber}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{job.title}</p>
              {job.completedAt && (
                <p className="mt-1 text-2xs text-faint">Completed {fmtDate(job.completedAt)}</p>
              )}
            </>
          ) : (
            <p className="mt-2 text-[13px] text-muted">—</p>
          )}
        </div>

        <div className="sm:text-right">
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between gap-3 sm:justify-end sm:gap-6">
              <dt className="text-muted">Issued</dt>
              <dd className="font-medium">{fmtDate(invoice.issueDate)}</dd>
            </div>
            <div className="flex justify-between gap-3 sm:justify-end sm:gap-6">
              <dt className="text-muted">Due</dt>
              <dd className={overdue ? 'font-medium text-danger' : 'font-medium'}>
                {fmtDate(invoice.dueDate)}
              </dd>
            </div>
            {invoice.paidAt && (
              <div className="flex justify-between gap-3 sm:justify-end sm:gap-6">
                <dt className="text-muted">Paid</dt>
                <dd className="font-medium text-ok">{fmtDate(invoice.paidAt)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* line items */}
      <div className="scroll-x">
        <table className="w-full min-w-[36rem] text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="px-7 py-3 text-2xs font-semibold uppercase tracking-[0.13em] text-faint">
                Description
              </th>
              <th className="w-24 px-3 py-3 text-2xs font-semibold uppercase tracking-[0.13em] text-faint">
                Type
              </th>
              <th className="w-16 px-3 py-3 text-right text-2xs font-semibold uppercase tracking-[0.13em] text-faint">
                Qty
              </th>
              <th className="w-28 px-3 py-3 text-right text-2xs font-semibold uppercase tracking-[0.13em] text-faint">
                Unit
              </th>
              <th className="w-28 px-7 py-3 text-right text-2xs font-semibold uppercase tracking-[0.13em] text-faint">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((li, i) => (
              <tr key={`${li.description}-${i}`} className="border-b border-line last:border-0">
                <td className="px-7 py-3.5 text-[13.5px]">{li.description}</td>
                <td className="px-3 py-3.5">
                  <span className="rounded-md bg-raised px-2 py-0.5 text-2xs uppercase tracking-[0.1em] text-muted">
                    {KIND_LABEL[li.kind]}
                  </span>
                </td>
                <td className="tnum px-3 py-3.5 text-right text-[13px]">{li.quantity}</td>
                <td className="tnum px-3 py-3.5 text-right text-[13px] text-muted">
                  {money(li.unitPrice)}
                </td>
                <td className="tnum px-7 py-3.5 text-right text-[13.5px] font-medium">
                  {money(li.quantity * li.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* totals */}
      <div className="flex justify-end border-t border-line px-7 py-5">
        <dl className="w-full max-w-xs space-y-2.5 text-[13.5px]">
          <div className="flex justify-between gap-6">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tnum">{money(invoice.subtotal)}</dd>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between gap-6 text-ok">
              <dt>Discount</dt>
              <dd className="tnum">−{money(invoice.discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-6">
            <dt className="text-muted">Tax ({invoice.taxRate}%)</dt>
            <dd className="tnum">{money(invoice.taxAmount)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 border-t border-line pt-3">
            <dt className="text-[14px] font-semibold">Total</dt>
            <dd className="tnum text-[19px] font-semibold">{money(invoice.total)}</dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt className="text-muted">Paid to date</dt>
            <dd className="tnum text-ok">−{money(invoice.amountPaid)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 border-t border-line pt-3">
            <dt className="text-[14px] font-semibold">Balance due</dt>
            <dd
              className={`tnum text-[22px] font-semibold ${
                invoice.balance > 0 ? (overdue ? 'text-danger' : 'text-ember') : 'text-ok'
              }`}
            >
              {money(invoice.balance)}
            </dd>
          </div>
        </dl>
      </div>

      {/* payment progress */}
      {invoice.total > 0 && (
        <div className="border-t border-line px-7 py-5">
          <div className="mb-2 flex items-baseline justify-between text-2xs">
            <span className="uppercase tracking-[0.12em] text-faint">Payment progress</span>
            <span className="tnum font-semibold">
              {Math.round((invoice.amountPaid / invoice.total) * 100)}%
            </span>
          </div>
          <Meter
            value={invoice.amountPaid}
            max={invoice.total}
            tone={invoice.balance <= 0 ? 'ok' : overdue ? 'danger' : 'frost'}
          />
        </div>
      )}

      {/* ledger */}
      {payments.length > 0 && (
        <div className="border-t border-line px-7 py-5">
          <p className="text-2xs uppercase tracking-[0.14em] text-faint">Payment history</p>
          <ul className="mt-3 divide-y divide-line">
            {payments.map((p) => (
              <li key={p._id} className="flex items-center justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="tnum text-[13px] font-medium">{p.paymentNumber}</p>
                  <p className="text-2xs text-muted">
                    {titleCase(p.method)} · {fmtDate(p.paidAt)}
                    {p.reference ? ` · ${p.reference}` : ''}
                  </p>
                </div>
                <span className="tnum shrink-0 text-[13.5px] font-semibold text-ok">
                  {money(p.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {invoice.notes && (
        <div className="border-t border-line px-7 py-5">
          <p className="text-2xs uppercase tracking-[0.14em] text-faint">Notes</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
