'use client';

import { AccountSettings } from '@/components/dashboard/AccountSettings';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function AdminProfilePage() {
  return (
    <DashboardShell roles={['admin']} title="Profile" subtitle="Your details and password">
      <AccountSettings />
    </DashboardShell>
  );
}
