import { ContractStatus, InvoiceStatus, JobStatus, Priority, QuoteStatus, RequestStatus, ServiceType } from './types';

/* ---------------------------------- money ---------------------------------- */

export const money = (value: number, opts: { cents?: boolean } = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: opts.cents === false ? 0 : 2,
    maximumFractionDigits: opts.cents === false ? 0 : 2,
  }).format(value ?? 0);

export const compactMoney = (value: number) =>
  value >= 1000
    ? `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value / 1000)}k`
    : `$${Math.round(value)}`;

export const num = (value: number) => new Intl.NumberFormat('en-US').format(value ?? 0);

/* ----------------------------------- time ---------------------------------- */

export const fmtDate = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const fmtDateShort = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

export const fmtTime = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—';

export const fmtDateTime = (value?: string | Date | null) =>
  value ? `${fmtDate(value)} · ${fmtTime(value)}` : '—';

export const fmtDay = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—';

/** "3 days ago" / "in 2 weeks", kept short for dense tables. */
export function relative(value?: string | Date | null): string {
  if (!value) return '—';
  const diff = new Date(value).getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000000],
    ['month', 2592000000],
    ['week', 604800000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return 'just now';
}

export const isToday = (value?: string | Date | null) => {
  if (!value) return false;
  const d = new Date(value);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

/* ---------------------------------- labels --------------------------------- */

export const SERVICE_LABELS: Record<ServiceType, string> = {
  installation: 'Installation',
  repair: 'Repair',
  maintenance: 'Maintenance',
  inspection: 'Inspection',
  'duct-cleaning': 'Duct Cleaning',
  thermostat: 'Thermostat',
  emergency: 'Emergency',
};

export const titleCase = (value?: string) =>
  (value ?? '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const serviceLabel = (t?: string) => SERVICE_LABELS[t as ServiceType] ?? titleCase(t);

export const initials = (name?: string) =>
  (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

export const addressLine = (a?: { line1: string; line2?: string; city: string; state: string; zip: string }) =>
  a ? [a.line1, a.line2, `${a.city}, ${a.state} ${a.zip}`].filter(Boolean).join(', ') : '—';

/* ----------------------------- status → colour ----------------------------- */
/* Tone maps to a semantic CSS colour so every surface renders status the same. */

export type Tone = 'frost' | 'ember' | 'ok' | 'warn' | 'danger' | 'info' | 'muted';

export const TONE_TEXT: Record<Tone, string> = {
  frost: 'text-frost',
  ember: 'text-ember',
  ok: 'text-ok',
  warn: 'text-warn',
  danger: 'text-danger',
  info: 'text-info',
  muted: 'text-muted',
};

const REQUEST_TONES: Record<RequestStatus, Tone> = {
  submitted: 'info',
  reviewing: 'info',
  quoted: 'warn',
  approved: 'frost',
  scheduled: 'frost',
  in_progress: 'ember',
  completed: 'ok',
  cancelled: 'muted',
};

const JOB_TONES: Record<JobStatus, Tone> = {
  unassigned: 'danger',
  assigned: 'info',
  en_route: 'warn',
  in_progress: 'ember',
  on_hold: 'muted',
  completed: 'ok',
  cancelled: 'muted',
};

const QUOTE_TONES: Record<QuoteStatus, Tone> = {
  draft: 'muted',
  sent: 'warn',
  accepted: 'ok',
  rejected: 'danger',
  expired: 'muted',
};

const INVOICE_TONES: Record<InvoiceStatus, Tone> = {
  draft: 'muted',
  sent: 'info',
  partial: 'warn',
  paid: 'ok',
  overdue: 'danger',
  void: 'muted',
};

const CONTRACT_TONES: Record<ContractStatus, Tone> = {
  pending: 'muted',
  active: 'ok',
  expiring: 'warn',
  expired: 'danger',
  cancelled: 'muted',
};

export const PRIORITY_TONES: Record<Priority, Tone> = {
  low: 'muted',
  normal: 'info',
  high: 'warn',
  emergency: 'danger',
};

export const TECH_STATUS_TONES: Record<string, Tone> = {
  available: 'ok',
  on_job: 'ember',
  off_duty: 'muted',
  on_leave: 'muted',
};

export function toneFor(kind: 'request' | 'job' | 'quote' | 'invoice' | 'contract' | 'priority' | 'tech', status?: string): Tone {
  if (!status) return 'muted';
  switch (kind) {
    case 'request': return REQUEST_TONES[status as RequestStatus] ?? 'muted';
    case 'job': return JOB_TONES[status as JobStatus] ?? 'muted';
    case 'quote': return QUOTE_TONES[status as QuoteStatus] ?? 'muted';
    case 'invoice': return INVOICE_TONES[status as InvoiceStatus] ?? 'muted';
    case 'contract': return CONTRACT_TONES[status as ContractStatus] ?? 'muted';
    case 'priority': return PRIORITY_TONES[status as Priority] ?? 'muted';
    case 'tech': return TECH_STATUS_TONES[status] ?? 'muted';
    default: return 'muted';
  }
}

/** Joins class names, dropping falsy values. */
export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' ');
