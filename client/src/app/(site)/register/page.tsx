import type { Metadata } from 'next';
import { RegisterForm } from '@/components/site/RegisterForm';

export const metadata: Metadata = {
  title: 'Create an account',
  description:
    'Create an ArcticAir customer account to track service requests, approve quotations, view invoices and manage your maintenance contract.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
