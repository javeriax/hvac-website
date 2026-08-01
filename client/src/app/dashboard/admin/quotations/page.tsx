'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { QuotationsWorkspace } from '@/components/dashboard/QuotationsWorkspace';

export default function AdminQuotationsPage() {
  return (
    <DashboardShell
      roles={['admin']}
      title="Quotation management"
      subtitle="Pipeline value, win rate and approval status"
    >
      <QuotationsWorkspace detailBase="/dashboard/dispatcher/requests" />
    </DashboardShell>
  );
}
