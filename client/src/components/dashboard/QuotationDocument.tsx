'use client';

import { Logo } from '@/components/brand';
import { IconPrint } from '@/components/icons';
import { Pill } from '@/components/ui';
import { addressLine, fmtDate, money, titleCase, toneFor } from '@/lib/format';
import { COMPANY } from '@/lib/site';
import { LineItem, Quotation, ServiceRequest, User } from '@/lib/types';

const KIND_LABEL: Record<LineItem['kind'], string> = {
  labor: 'Labour',
  equipment: 'Equipment',
  part: 'Part',
  fee: 'Fee',
};

/**
 * Print-ready quotation. Used by the customer portal and the staff back office
 * so both sides are always looking at the identical document.
 */
export function QuotationDocument({ quote }: { quote: Quotation }) {
  const customer = typeof quote.customer === 'object' ? (quote.customer as User) : undefined;
  const request =
    typeof quote.serviceRequest === 'object' ? (quote.serviceRequest as ServiceRequest) : undefined;
  const expired = new Date(quote.validUntil).getTime() < Date.now() && quote.status === 'sent';

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      {/* letterhead */}
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
            <p className="text-2xs uppercase tracking-[0.18em] text-faint">Quotation</p>
            <p className="tnum mt-1 text-[21px] font-semibold">{quote.quoteNumber}</p>
            <div className="mt-2.5 flex justify-end">
              <Pill tone={expired ? 'muted' : toneFor('quote', quote.status)}>
                {expired ? 'Expired' : titleCase(quote.status)}
              </Pill>
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

      {/* parties */}
      <div className="grid gap-6 border-b border-line px-7 py-6 sm:grid-cols-3">
        <div>
          <p className="text-2xs uppercase tracking-[0.14em] text-faint">Prepared for</p>
          <p className="mt-2 text-[14px] font-semibold">{customer?.name ?? '—'}</p>
          {customer?.customer?.companyName && (
            <p className="text-[13px] text-muted">{customer.customer.companyName}</p>
          )}
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            {customer?.email}
            {customer?.phone ? <><br />{customer.phone}</> : null}
          </p>
        </div>

        <div>
          <p className="text-2xs uppercase tracking-[0.14em] text-faint">Service address</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {request ? addressLine(request.address) : addressLine(customer?.customer?.address)}
          </p>
          {request && (
            <p className="tnum mt-2 text-2xs text-faint">Ref {request.trackingCode}</p>
          )}
        </div>

        <div className="sm:text-right">
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between gap-3 sm:justify-end sm:gap-6">
              <dt className="text-muted">Issued</dt>
              <dd className="font-medium">{fmtDate(quote.sentAt ?? quote.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-3 sm:justify-end sm:gap-6">
              <dt className="text-muted">Valid until</dt>
              <dd className={expired ? 'font-medium text-danger' : 'font-medium'}>
                {fmtDate(quote.validUntil)}
              </dd>
            </div>
            {quote.respondedAt && (
              <div className="flex justify-between gap-3 sm:justify-end sm:gap-6">
                <dt className="text-muted">Responded</dt>
                <dd className="font-medium">{fmtDate(quote.respondedAt)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* scope */}
      {request && (
        <div className="border-b border-line px-7 py-5">
          <p className="text-2xs uppercase tracking-[0.14em] text-faint">Scope of work</p>
          <p className="mt-2 text-[14px] font-medium">{request.title}</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{request.description}</p>
        </div>
      )}

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
            {quote.lineItems.map((li, i) => (
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
            <dt className="text-muted">Labour</dt>
            <dd className="tnum">{money(quote.laborTotal)}</dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt className="text-muted">Equipment &amp; parts</dt>
            <dd className="tnum">{money(quote.equipmentTotal)}</dd>
          </div>
          <div className="flex justify-between gap-6 border-t border-line pt-2.5">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tnum">{money(quote.subtotal)}</dd>
          </div>
          {quote.discountAmount > 0 && (
            <div className="flex justify-between gap-6 text-ok">
              <dt>
                Discount
                {quote.discountType === 'percent' ? ` (${quote.discountValue}%)` : ''}
              </dt>
              <dd className="tnum">−{money(quote.discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-6">
            <dt className="text-muted">Tax ({quote.taxRate}%)</dt>
            <dd className="tnum">{money(quote.taxAmount)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 border-t border-line pt-3">
            <dt className="text-[14px] font-semibold">Total</dt>
            <dd className="tnum text-[22px] font-semibold text-frost">{money(quote.total)}</dd>
          </div>
        </dl>
      </div>

      {/* notes */}
      {(quote.notes || quote.terms || quote.rejectionReason) && (
        <div className="space-y-4 border-t border-line px-7 py-5">
          {quote.notes && (
            <div>
              <p className="text-2xs uppercase tracking-[0.14em] text-faint">Notes</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{quote.notes}</p>
            </div>
          )}
          {quote.rejectionReason && (
            <div>
              <p className="text-2xs uppercase tracking-[0.14em] text-danger">Declined because</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{quote.rejectionReason}</p>
            </div>
          )}
          {quote.terms && (
            <div>
              <p className="text-2xs uppercase tracking-[0.14em] text-faint">Terms</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-faint">{quote.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
