'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { IconArrowRight, IconCheck, IconSpark } from '@/components/icons';
import { Alert, Button, SelectField, TextArea, TextField } from '@/components/ui';
import { ApiError, api } from '@/lib/api';

const SUBJECTS = [
  { value: 'General enquiry', label: 'General enquiry' },
  { value: 'Request a quotation', label: 'Request a quotation' },
  { value: 'Maintenance plan question', label: 'Maintenance plan question' },
  { value: 'Existing job or invoice', label: 'Existing job or invoice' },
  { value: 'Commercial contract', label: 'Commercial contract' },
  { value: 'Feedback or complaint', label: 'Feedback or complaint' },
];

export function ContactForm() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSending(true);

    const fd = new FormData(e.currentTarget);
    try {
      await api.post('/contact', {
        name: fd.get('name'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        subject: fd.get('subject'),
        message: fd.get('message'),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send your message');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-ok/30 bg-ok/[0.05] p-12 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-ok/30 bg-ok/10 text-ok">
          <IconCheck className="h-6 w-6" />
        </span>
        <h2 className="mt-6 text-[21px] font-semibold">Message received</h2>
        <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted">
          It is already in our dispatch queue. Expect a reply within one business day — sooner if
          you marked it urgent.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/request-quote" className="btn-primary btn-sm">
            Request a quote
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button onClick={() => setSent(false)} className="btn-ghost btn-sm">
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-card border border-line bg-surface p-7">
      <div className="flex items-center gap-2.5">
        <IconSpark className="h-4 w-4 text-frost" />
        <h2 className="text-[17px] font-semibold">Send us a message</h2>
      </div>
      <p className="mt-2 text-[13.5px] text-muted">
        For a priced estimate, the{' '}
        <Link href="/request-quote" className="link-underline text-frost">
          quote request form
        </Link>{' '}
        gets you there faster.
      </p>

      {error && (
        <div className="mt-5">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="Your name" placeholder="Alex Rivera" required autoComplete="name" />
        <TextField
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <TextField name="phone" type="tel" label="Phone" placeholder="(602) 555-0142" autoComplete="tel" />
        <SelectField name="subject" label="Subject" options={SUBJECTS} defaultValue={SUBJECTS[0].value} />
      </div>

      <div className="mt-4">
        <TextArea
          name="message"
          label="How can we help?"
          rows={6}
          required
          placeholder="Tell us what the system is doing, roughly how old it is, and which city you are in."
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-2xs leading-relaxed text-faint">
          We use your details to respond to this enquiry only.
        </p>
        <Button type="submit" loading={sending}>
          {sending ? 'Sending' : 'Send message'}
          {!sending && <IconArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}
