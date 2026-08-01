'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { RequestsWorkspace } from '@/components/dashboard/RequestsWorkspace';

export default function AdminRequestsPage() {
  return (
    <DashboardShell
      roles={['admin']}
      title="Service requests"
      subtitle="Every request across the business"
    >
      <RequestsWorkspace detailBase="/dashboard/dispatcher/requests" initialTab="all" />
    </DashboardShell>
  );
}
