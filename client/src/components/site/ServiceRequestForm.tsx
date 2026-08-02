'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCamera,
  IconCheck,
  IconClock,
  IconFlame,
  IconMapPin,
  IconUser,
  IconX,
  IconClipboard,
} from '@/components/icons';
import { Alert, Button, SelectField, TextArea, TextField } from '@/components/ui';
import { ApiError, API_BASE, tokenStore } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cx, serviceLabel } from '@/lib/format';
import { SERVICES, SERVICE_AREAS } from '@/lib/site';
import { ServiceType } from '@/lib/types';

const STEPS = ['Service', 'Details', 'Location', 'Contact'] as const;
const MAX_PHOTOS = 6;

const PRIORITY_LABELS: Record<'low' | 'normal' | 'high' | 'emergency', string> = {
  low: 'Whenever convenient',
  normal: 'Within a week',
  high: 'As soon as possible',
  emergency: 'Emergency',
};

interface FormState {
  serviceType: ServiceType | '';
  propertyType: 'residential' | 'commercial';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  title: string;
  description: string;
  systemBrand: string;
  systemAge: string;
  preferredDate: string;
  preferredWindow: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

const EMPTY: FormState = {
  serviceType: '',
  propertyType: 'residential',
  priority: 'normal',
  title: '',
  description: '',
  systemBrand: '',
  systemAge: '',
  preferredDate: '',
  preferredWindow: 'anytime',
  line1: '',
  line2: '',
  city: '',
  state: 'AZ',
  zip: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
};

export function ServiceRequestForm() {
  const params = useSearchParams();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ trackingCode: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Pre-fill from query string (?service= / ?city=) and the signed-in profile.
  useEffect(() => {
    const svc = params.get('service');
    const city = params.get('city');
    setForm((f) => ({
      ...f,
      serviceType: (SERVICES.some((s) => s.slug === svc) ? (svc as ServiceType) : f.serviceType),
      city: city ?? f.city,
    }));
  }, [params]);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      contactName: f.contactName || user.name,
      contactEmail: f.contactEmail || user.email,
      contactPhone: f.contactPhone || user.phone || '',
      propertyType: user.customer?.propertyType ?? f.propertyType,
      line1: f.line1 || user.customer?.address.line1 || '',
      line2: f.line2 || user.customer?.address.line2 || '',
      city: f.city || user.customer?.address.city || '',
      state: user.customer?.address.state || f.state,
      zip: f.zip || user.customer?.address.zip || '',
    }));
  }, [user]);

  // Revoke object URLs when previews change so we do not leak blobs.
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files).slice(0, MAX_PHOTOS - photos.length);
    setPhotos((p) => [...p, ...incoming]);
    setPreviews((p) => [...p, ...incoming.map((f) => URL.createObjectURL(f))]);
  };

  const removePhoto = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const validateStep = (index: number) => {
    const errs: Record<string, string> = {};
    if (index === 0 && !form.serviceType) errs.serviceType = 'Choose the type of work you need';
    if (index === 1) {
      if (form.description.trim().length < 15) {
        errs.description = 'Please describe the issue in a little more detail (15+ characters)';
      }
    }
    if (index === 2) {
      if (!form.line1.trim()) errs.line1 = 'Street address is required';
      if (!form.city.trim()) errs.city = 'City is required';
      if (!form.zip.trim()) errs.zip = 'ZIP code is required';
    }
    if (index === 3) {
      if (!form.contactName.trim()) errs.contactName = 'Your name is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) errs.contactEmail = 'A valid email is required';
      if (form.contactPhone.replace(/\D/g, '').length < 10) errs.contactPhone = 'A valid phone number is required';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => {
    setFieldErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = async () => {
    if (!validateStep(3)) return;
    setError(null);
    setSubmitting(true);

    const fd = new FormData();
    fd.append('serviceType', form.serviceType);
    fd.append('propertyType', form.propertyType);
    fd.append('priority', form.serviceType === 'emergency' ? 'emergency' : form.priority);
    fd.append('title', form.title || `${serviceLabel(form.serviceType)} request`);
    fd.append('description', form.description);
    fd.append('systemBrand', form.systemBrand);
    fd.append('systemAge', form.systemAge);
    if (form.preferredDate) fd.append('preferredDate', form.preferredDate);
    fd.append('preferredWindow', form.preferredWindow);
    fd.append(
      'address',
      JSON.stringify({
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        zip: form.zip,
      }),
    );
    fd.append('contactName', form.contactName);
    fd.append('contactEmail', form.contactEmail);
    fd.append('contactPhone', form.contactPhone);
    photos.forEach((p) => fd.append('photos', p));

    try {
      // Sent through fetch directly so the multipart boundary is preserved.
      const token = tokenStore.get();
      const res = await fetch(`${API_BASE}/service-requests?folder=requests`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const payload = await res.json();
      if (!res.ok) throw new ApiError(res.status, payload.message ?? 'Could not submit your request');
      setResult({ trackingCode: payload.data.trackingCode });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your request');
    } finally {
      setSubmitting(false);
    }
  };

  const selected = useMemo(
    () => SERVICES.find((s) => s.slug === form.serviceType),
    [form.serviceType],
  );

  /* --------------------------------- success --------------------------------- */
  if (result) {
    return (
      <div className="rounded-card border border-ok/30 bg-ok/[0.05] p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-ok/30 bg-ok/10 text-ok">
          <IconCheck className="h-6 w-6" />
        </span>
        <h2 className="mt-6 text-[23px] font-semibold">Request logged</h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          A dispatcher is reviewing it now. Keep this tracking code, it is all you need to follow
          the request, with or without an account.
        </p>

        <div className="mx-auto mt-7 inline-flex items-center gap-3 rounded-xl border border-line bg-surface px-5 py-3.5">
          <span className="text-2xs uppercase tracking-[0.14em] text-faint">Tracking code</span>
          <span className="tnum text-[19px] font-semibold text-frost">{result.trackingCode}</span>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/track?code=${result.trackingCode}`} className="btn-primary btn-sm">
            Track this request
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
          {!user && (
            <Link href="/register" className="btn-ghost btn-sm">
              Create an account
            </Link>
          )}
          {user && (
            <Link href="/dashboard/customer/requests" className="btn-ghost btn-sm">
              Open my dashboard
            </Link>
          )}
        </div>
      </div>
    );
  }

  /* ---------------------------------- wizard --------------------------------- */
  return (
    <div className="rounded-card border border-line bg-surface">
      {/* progress rail */}
      <div className="flex items-center gap-2 border-b border-line px-6 py-4">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={cx(
                'flex items-center gap-2 whitespace-nowrap text-2xs font-semibold uppercase tracking-[0.12em] transition-colors',
                i === step ? 'text-frost' : i < step ? 'text-muted hover:text-ink' : 'text-faint',
                i < step && 'cursor-pointer',
              )}
            >
              <span
                className={cx(
                  'grid h-5 w-5 place-items-center rounded-full border text-[10px]',
                  i === step
                    ? 'border-frost bg-frost/12 text-frost'
                    : i < step
                      ? 'border-ok/40 bg-ok/10 text-ok'
                      : 'border-line text-faint',
                )}
              >
                {i < step ? <IconCheck className="h-3 w-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <span
                className={cx('h-px flex-1 transition-colors', i < step ? 'bg-ok/40' : 'bg-line')}
              />
            )}
          </div>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        {error && (
          <div className="mb-6">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}

        {/* ------------------------------ step 1 ------------------------------ */}
        {step === 0 && (
          <div className="animate-fade-up">
            <h2 className="text-[19px] font-semibold">What do you need?</h2>
            <p className="mt-1.5 text-[13.5px] text-muted">
              Pick the closest match, a dispatcher will confirm before anything is scheduled.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s, idx) => {
                const on = form.serviceType === s.slug;
                const urgent = s.slug === 'emergency';
                return (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => set('serviceType', s.slug)}
                    className={cx(
                      'relative overflow-hidden rounded-xl border p-4 pl-5 text-left transition-all',
                      on
                        ? urgent
                          ? 'border-ember/50 bg-ember/[0.07]'
                          : 'border-frost/50 bg-frost/[0.06]'
                        : 'border-line bg-sunken hover:border-frost/30',
                    )}
                  >
                    {/* selection reads as a coloured edge, not a badge */}
                    <span
                      aria-hidden
                      className={cx(
                        'absolute inset-y-0 left-0 w-[3px] transition-opacity',
                        urgent ? 'bg-ember' : 'bg-frost',
                        on ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[14px] font-semibold">{s.name}</span>
                      <span
                        className={cx(
                          'tnum text-2xs',
                          on ? (urgent ? 'text-ember' : 'text-frost') : 'text-faint',
                        )}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </span>
                    <span className="mt-1 block text-2xs leading-snug text-muted">{s.short}</span>
                    <span className="tnum mt-2 block text-2xs text-faint">from {s.startingAt}</span>
                  </button>
                );
              })}
            </div>
            {fieldErrors.serviceType && (
              <p className="mt-3 text-xs text-danger">{fieldErrors.serviceType}</p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <span className="label">Property type</span>
                <div className="flex gap-2">
                  {(['residential', 'commercial'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('propertyType', t)}
                      className={cx(
                        'flex-1 rounded-xl border px-4 py-2.5 text-[13.5px] font-medium capitalize transition-colors',
                        form.propertyType === t
                          ? 'border-frost/50 bg-frost/[0.06] text-frost'
                          : 'border-line bg-sunken text-muted hover:text-ink',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {form.serviceType !== 'emergency' && (
                <SelectField
                  label="How urgent is it?"
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value as FormState['priority'])}
                  options={[
                    { value: 'low', label: 'Whenever convenient' },
                    { value: 'normal', label: 'Within a week' },
                    { value: 'high', label: 'As soon as possible' },
                  ]}
                />
              )}
            </div>

            {form.serviceType === 'emergency' && (
              <div className="mt-5">
                <Alert tone="danger" title="Is this happening right now?">
                  For gas odours, smoke or an unsafe electrical fault, call{' '}
                  <a href="tel:6025550911" className="font-semibold underline">
                    (602) 555-0911
                  </a>{' '}
                  instead of filling in this form. A dispatcher answers 24/7.
                </Alert>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------ step 2 ------------------------------ */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h2 className="text-[19px] font-semibold">Tell us what it is doing</h2>
            <p className="mt-1.5 text-[13.5px] text-muted">
              Specifics help us send the right technician with the right parts on the van.
            </p>

            <div className="mt-6 space-y-4">
              <TextField
                label="Short summary"
                placeholder={selected ? `e.g. ${selected.short}` : 'e.g. AC blowing warm air upstairs'}
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                hint="Optional, we will generate one if you leave it blank."
              />

              <TextArea
                label="Describe the issue"
                required
                rows={5}
                value={form.description}
                error={fieldErrors.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="When did it start? Which rooms are affected? Any noises, smells or error codes? Has anyone worked on it recently?"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="System brand"
                  placeholder="Carrier, Trane, Goodman…"
                  value={form.systemBrand}
                  onChange={(e) => set('systemBrand', e.target.value)}
                />
                <TextField
                  label="Approximate age"
                  placeholder="e.g. 12 years"
                  value={form.systemAge}
                  onChange={(e) => set('systemAge', e.target.value)}
                />
              </div>

              {/* photo upload */}
              <div>
                <span className="label">Photos ({photos.length}/{MAX_PHOTOS})</span>
                <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={photos.length >= MAX_PHOTOS}
                    className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-sunken px-6 text-muted transition-colors hover:border-frost/40 hover:text-frost disabled:opacity-50 sm:w-40"
                  >
                    <IconCamera className="h-5 w-5" />
                    <span className="text-2xs uppercase tracking-[0.12em]">Add photos</span>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      addPhotos(e.target.files);
                      e.target.value = '';
                    }}
                  />

                  {previews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {previews.map((src, i) => (
                        <div
                          key={src}
                          className="group relative aspect-square overflow-hidden rounded-lg border border-line"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Attachment ${i + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-md bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label={`Remove photo ${i + 1}`}
                          >
                            <IconX className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-faint">
                  A photo of the outdoor unit&apos;s data plate and anything visibly wrong saves a lot of
                  guesswork. Up to {MAX_PHOTOS} images, 8 MB each.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------ step 3 ------------------------------ */}
        {step === 2 && (
          <div className="animate-fade-up">
            <h2 className="text-[19px] font-semibold">Where and when</h2>
            <p className="mt-1.5 text-[13.5px] text-muted">
              We will confirm an exact arrival window once a technician is assigned.
            </p>

            <div className="mt-6 space-y-4">
              <TextField
                label="Street address"
                required
                value={form.line1}
                error={fieldErrors.line1}
                onChange={(e) => set('line1', e.target.value)}
                placeholder="4820 N Camelback Ridge Rd"
                autoComplete="address-line1"
              />
              <TextField
                label="Apartment, suite, unit"
                value={form.line2}
                onChange={(e) => set('line2', e.target.value)}
                placeholder="Unit 12"
                autoComplete="address-line2"
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <SelectField
                  label="City"
                  required
                  value={form.city}
                  error={fieldErrors.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="Select a city"
                  options={SERVICE_AREAS.map((a) => ({ value: a.city, label: a.city }))}
                />
                <TextField label="State" value={form.state} onChange={(e) => set('state', e.target.value)} />
                <TextField
                  label="ZIP"
                  required
                  value={form.zip}
                  error={fieldErrors.zip}
                  onChange={(e) => set('zip', e.target.value)}
                  placeholder="85251"
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  type="date"
                  label="Preferred date"
                  value={form.preferredDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => set('preferredDate', e.target.value)}
                />
                <SelectField
                  label="Preferred window"
                  value={form.preferredWindow}
                  onChange={(e) => set('preferredWindow', e.target.value)}
                  options={[
                    { value: 'anytime', label: 'Any time' },
                    { value: 'morning', label: 'Morning (8am – 12pm)' },
                    { value: 'afternoon', label: 'Afternoon (12pm – 4pm)' },
                    { value: 'evening', label: 'Evening (4pm – 7pm)' },
                  ]}
                />
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-line bg-sunken px-4 py-3">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-frost" />
                <p className="text-[13px] leading-relaxed text-muted">
                  We cover twelve cities across Maricopa County. Outside that,{' '}
                  <Link href="/contact" className="link-underline text-frost">
                    send us the address
                  </Link>{' '}
                  and we will tell you honestly whether we can serve it well.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------ step 4 ------------------------------ */}
        {step === 3 && (
          <div className="animate-fade-up">
            <h2 className="text-[19px] font-semibold">How do we reach you?</h2>
            <p className="mt-1.5 text-[13.5px] text-muted">
              No account needed, you will get a tracking code either way.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <TextField
                label="Full name"
                required
                value={form.contactName}
                error={fieldErrors.contactName}
                onChange={(e) => set('contactName', e.target.value)}
                autoComplete="name"
                wrapClass="sm:col-span-2"
              />
              <TextField
                type="email"
                label="Email"
                required
                value={form.contactEmail}
                error={fieldErrors.contactEmail}
                onChange={(e) => set('contactEmail', e.target.value)}
                autoComplete="email"
              />
              <TextField
                type="tel"
                label="Phone"
                required
                value={form.contactPhone}
                error={fieldErrors.contactPhone}
                onChange={(e) => set('contactPhone', e.target.value)}
                autoComplete="tel"
                placeholder="(602) 555-0142"
              />
            </div>

            {/* summary */}
            <div className="mt-7 rounded-xl border border-line bg-sunken p-5">
              <p className="mb-4 text-2xs font-semibold uppercase tracking-[0.16em] text-faint">
                Review
              </p>
              <dl className="space-y-3 text-[13.5px]">
                {[
                  ['Service', selected?.name ?? '—', IconClipboard],
                  ['Priority', PRIORITY_LABELS[form.serviceType === 'emergency' ? 'emergency' : form.priority], form.serviceType === 'emergency' ? IconFlame : IconClock],
                  ['Address', [form.line1, form.city, form.state, form.zip].filter(Boolean).join(', ') || '—', IconMapPin],
                  ['Contact', form.contactName || '—', IconUser],
                ].map(([label, value, Icon]) => {
                  const I = Icon as (p: { className?: string }) => JSX.Element;
                  return (
                    <div key={label as string} className="flex items-start justify-between gap-4">
                      <dt className="flex items-center gap-2 text-muted">
                        <I className="h-3.5 w-3.5 text-faint" />
                        {label as string}
                      </dt>
                      <dd className="max-w-[62%] text-right font-medium">{value as string}</dd>
                    </div>
                  );
                })}
                {photos.length > 0 && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="flex items-center gap-2 text-muted">
                      <IconCamera className="h-3.5 w-3.5 text-faint" />
                      Photos
                    </dt>
                    <dd className="tnum font-medium">{photos.length} attached</dd>
                  </div>
                )}
              </dl>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-faint">
              Submitting creates a service request in our dispatch queue. It does not commit you to
              any work, you will receive a priced quotation to approve or decline first.
            </p>
          </div>
        )}

        {/* ------------------------------ controls ------------------------------ */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          <Button variant="ghost" size="sm" onClick={back} disabled={step === 0}>
            <IconArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>

          <span className="tnum text-2xs uppercase tracking-[0.14em] text-faint">
            Step {step + 1} of {STEPS.length}
          </span>

          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={next}>
              Continue
              <IconArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" onClick={submit} loading={submitting}>
              {submitting ? 'Submitting' : 'Submit request'}
              {!submitting && <IconCheck className="h-3.5 w-3.5" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
