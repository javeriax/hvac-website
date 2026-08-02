'use client';

import { AccountSettings } from '@/components/dashboard/AccountSettings';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function DispatcherProfilePage() {
  return (
    <DashboardShell
      roles={['dispatcher']}
      title="Profile"
      subtitle="Your details and password"
    >
      <AccountSettings />
    </DashboardShell>
  );
}
