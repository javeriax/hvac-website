import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/site/LoginForm';
import { Skeleton } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your ArcticAir account to manage requests, quotations, invoices and maintenance contracts.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto my-24 h-96 max-w-md" />}>
      <LoginForm />
    </Suspense>
  );
}
