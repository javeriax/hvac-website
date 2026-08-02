'use client';

import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DataTable, TablePanel } from '@/components/dashboard/DataTable';
import { IconDoc } from '@/components/icons';
import { LinkButton, Pill } from '@/components/ui';
import { fmtDate, money, relative, titleCase, toneFor } from '@/lib/format';
import { useApi } from '@/lib/useApi';
import { Quotation, ServiceRequest } from '@/lib/types';

export default function CustomerQuotationsPage() {
  const router = useRouter();
  const { data, loading, error } = useApi<Quotation[]>('/quotations');

  const pending = (data ?? []).filter((q) => q.status === 'sent');

  return (
    <DashboardShell
      roles={['customer']}
      title="Quotations"
      subtitle="Review the line items, then approve or decline"
    >
      <div className="space-y-5">
        {pending.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-warn/35 bg-warn/[0.06] px-5 py-4">
            <p className="text-[13.5px]">
              <span className="font-semibold">
                {pending.length} quotation{pending.length > 1 ? 's' : ''} awaiting your decision.
              </span>{' '}
              <span className="text-muted">Nothing is scheduled until you approve.</span>
            </p>
            <LinkButton href={`/dashboard/customer/quotations/${pending[0]._id}`} size="sm">
              Review {pending[0].quoteNumber}
            </LinkButton>
          </div>
        )}

        <TablePanel title="All quotations">
          <DataTable<Quotation>
            rows={data}
            loading={loading}
            error={error}
            onRowClick={(row) => router.push(`/dashboard/customer/quotations/${row._id}`)}
            empty={{
              icon: <IconDoc className="h-5 w-5" />,
              title: 'No quotations yet',
              body: 'Once a dispatcher prices your request, the estimate appears here.',
            }}
            columns={[
              {
                key: 'number',
                header: 'Quote',
                render: (q) => {
                  const req = typeof q.serviceRequest === 'object' ? (q.serviceRequest as ServiceRequest) : undefined;
                  return (
                    <div>
                      <p className="tnum text-[13.5px] font-medium">{q.quoteNumber}</p>
                      <p className="truncate text-2xs text-muted">{req?.title ?? '—'}</p>
                    </div>
                  );
                },
              },
              {
                key: 'issued',
                header: 'Issued',
                className: 'w-36',
                render: (q) => (
                  <div>
                    <p className="text-[13px]">{fmtDate(q.sentAt ?? q.createdAt)}</p>
                    <p className="text-2xs text-faint">{relative(q.sentAt ?? q.createdAt)}</p>
                  </div>
                ),
              },
              {
                key: 'valid',
                header: 'Valid until',
                className: 'w-32',
                render: (q) => <span className="text-[13px] text-muted">{fmtDate(q.validUntil)}</span>,
              },
              {
                key: 'total',
                header: 'Total',
                className: 'w-28 text-right',
                render: (q) => <span className="tnum text-[14px] font-semibold">{money(q.total)}</span>,
              },
              {
                key: 'status',
                header: 'Status',
                className: 'w-32',
                render: (q) => <Pill tone={toneFor('quote', q.status)}>{titleCase(q.status)}</Pill>,
              },
            ]}
          />
        </TablePanel>
      </div>
    </DashboardShell>
  );
}
