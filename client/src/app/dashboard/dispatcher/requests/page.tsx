'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { RequestsWorkspace } from '@/components/dashboard/RequestsWorkspace';

export default function DispatcherRequestsPage() {
  return (
    <DashboardShell
      roles={['dispatcher', 'admin']}
      title="Service requests"
      subtitle="Triage, quote and schedule incoming work"
    >
      <RequestsWorkspace detailBase="/dashboard/dispatcher/requests" initialTab="triage" />
    </DashboardShell>
  );
}
