'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { IconCheck, IconClock, IconStar } from '@/components/icons';
import { Alert, Button, Modal, SelectField, TextArea, useToasts } from '@/components/ui';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cx } from '@/lib/format';
import { SERVICES } from '@/lib/site';
import { Testimonial } from '@/lib/types';

/**
 * "Write a review" for signed-in customers.
 *
 * Anyone not signed in, or signed in as staff, gets a prompt instead of the
 * form. A submitted review is held unpublished until an admin approves it,
 * so this explains that rather than leaving people wondering why theirs has
 * not appeared on the page.
 */
export function ReviewForm({ onPublishedChange }: { onPublishedChange?: () => void }) {
  const { user, loading } = useAuth();
  const { push, view } = useToasts();

  const [open, setOpen] = useState(false);
  const [mine, setMine] = useState<Testimonial | null>(null);
  const [checked, setChecked] = useState(false);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCustomer = user?.role === 'customer';

  // Find out whether this customer already left one, so we can show their
  // status instead of a form they are not allowed to submit again.
  useEffect(() => {
    if (!isCustomer) {
      setChecked(true);
      return;
    }
    api
      .get<Testimonial | null>('/testimonials/mine')
      .then((r) => setMine(r ?? null))
      .catch(() => setMine(null))
      .finally(() => setChecked(true));
  }, [isCustomer]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    setBusy(true);
    try {
      const created = await api.post<Testimonial>('/testimonials', {
        rating,
        quote: fd.get('quote'),
        serviceType: fd.get('serviceType'),
      });
      setMine(created);
      setOpen(false);
      push('Thanks. Your review is with our team for approval.');
      onPublishedChange?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your review');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !checked) return null;

  /* ---------------------------- not a customer ---------------------------- */
  if (!user) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center">
        <h2 className="text-[22px] font-semibold">Been a customer?</h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          Sign in to your account and tell us how the visit went. Honest criticism is more useful to
          us than another five stars.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/login?next=/testimonials" className="btn-primary btn-sm">
            Sign in to write a review
          </Link>
          <Link href="/request-quote" className="btn-ghost btn-sm">
            Request a quote
          </Link>
        </div>
      </div>
    );
  }

  if (!isCustomer) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center">
        <h2 className="text-[20px] font-semibold">Reviews come from customers</h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          You are signed in as a staff account. Customer reviews are written from a customer login,
          and admins approve them from the dashboard.
        </p>
      </div>
    );
  }

  /* --------------------------- already reviewed --------------------------- */
  if (mine) {
    return (
      <div
        className={cx(
          'rounded-card border p-8 text-center',
          mine.isPublished ? 'border-ok/30 bg-ok/[0.05]' : 'border-warn/30 bg-warn/[0.05]',
        )}
      >
        <span
          className={cx(
            'mx-auto grid h-11 w-11 place-items-center rounded-full border',
            mine.isPublished
              ? 'border-ok/30 bg-ok/10 text-ok'
              : 'border-warn/30 bg-warn/10 text-warn',
          )}
        >
          {mine.isPublished ? <IconCheck className="h-5 w-5" /> : <IconClock className="h-5 w-5" />}
        </span>

        <h2 className="mt-5 text-[20px] font-semibold">
          {mine.isPublished ? 'Your review is live' : 'Your review is awaiting approval'}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          {mine.isPublished
            ? 'Thanks for taking the time. It is on this page along with everyone else.'
            : 'A member of our team reads every review before it goes on the site. It will appear here shortly.'}
        </p>

        <blockquote className="mx-auto mt-6 max-w-lg rounded-xl border border-line bg-surface p-5 text-left">
          <span className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <IconStar
                key={i}
                className={cx('h-3.5 w-3.5', i < mine.rating ? 'fill-current text-ember' : 'text-line')}
              />
            ))}
          </span>
          <p className="mt-3 text-[14px] leading-relaxed">{mine.quote}</p>
        </blockquote>
      </div>
    );
  }

  /* ------------------------------ write one ------------------------------- */
  return (
    <>
      {view}

      <div className="rounded-card border border-frost/30 bg-frost/[0.04] p-8 text-center">
        <h2 className="text-[22px] font-semibold">How did we do?</h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          You are signed in as {user.name.split(' ')[0]}. Leave a review of your last visit. Honest
          criticism is more useful to us than another five stars.
        </p>
        <Button className="mt-6" onClick={() => setOpen(true)}>
          <IconStar className="h-4 w-4" />
          Write a review
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Write a review"
        subtitle="Published on our site once a team member has read it."
      >
        <form onSubmit={submit} className="space-y-5">
          {error && <Alert tone="danger">{error}</Alert>}

          <div>
            <span className="label">Your rating</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHovered(n)}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    className="rounded p-0.5 transition-transform hover:scale-110"
                  >
                    <IconStar
                      className={cx(
                        'h-7 w-7 transition-colors',
                        n <= (hovered || rating) ? 'fill-current text-ember' : 'text-line',
                      )}
                    />
                  </button>
                ))}
              </div>
              <span className="tnum ml-1 text-[13px] text-muted">{hovered || rating} / 5</span>
            </div>
          </div>

          <SelectField
            name="serviceType"
            label="What was the visit for?"
            defaultValue="maintenance"
            options={SERVICES.map((s) => ({ value: s.slug, label: s.name }))}
          />

          <TextArea
            name="quote"
            label="Your review"
            required
            rows={5}
            minLength={20}
            placeholder="What happened, who came out, and how it went. Specifics help other people more than adjectives."
            hint="At least 20 characters."
          />

          <p className="text-2xs leading-relaxed text-faint">
            Your first name, last initial and city are shown with the review. Your email is never
            published.
          </p>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" size="sm" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={busy}>
              Submit review
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
