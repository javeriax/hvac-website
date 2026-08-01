'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { QuotationsWorkspace } from '@/components/dashboard/QuotationsWorkspace';

export default function DispatcherQuotationsPage() {
  return (
    <DashboardShell
      roles={['dispatcher', 'admin']}
      title="Quotations"
      subtitle="Pipeline, win rate and outstanding decisions"
    >
      <QuotationsWorkspace detailBase="/dashboard/dispatcher/requests" />
    </DashboardShell>
  );
}
