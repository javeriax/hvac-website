'use client';

import Link from 'next/link';
import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  useEffect,
  useId,
  useState,
} from 'react';
import { Tone, cx, initials } from '@/lib/format';
import { IconAlert, IconCheck, IconInfo, IconX } from './icons';

/* ================================== buttons ================================= */

type Variant = 'primary' | 'ember' | 'ghost' | 'soft';
type Size = 'sm' | 'md' | 'xs';

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn-primary',
  ember: 'btn-ember',
  ghost: 'btn-ghost',
  soft: 'btn-soft',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(VARIANT_CLASS[variant], size === 'sm' && 'btn-sm', size === 'xs' && 'btn-xs', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx(VARIANT_CLASS[variant], size === 'sm' && 'btn-sm', size === 'xs' && 'btn-xs', className)}
    >
      {icon}
      {children}
    </Link>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        'inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
      aria-hidden
    />
  );
}

/* =================================== cards ================================== */

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <div className={cx('card', padded && 'p-5', className)}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-sunken text-frost">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-[15px] font-semibold leading-tight">{title}</h3>
          {subtitle && <p className="mt-1 text-[13px] leading-snug text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* =================================== pills ================================== */

const PILL_TONE: Record<Tone, string> = {
  frost: 'text-frost',
  ember: 'text-ember',
  ok: 'text-ok',
  warn: 'text-warn',
  danger: 'text-danger',
  info: 'text-info',
  muted: 'text-muted',
};

export function Pill({ tone = 'muted', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx('pill', PILL_TONE[tone])}>{children}</span>;
}

export function Dot({ tone = 'muted', pulse }: { tone?: Tone; pulse?: boolean }) {
  return (
    <span className={cx('relative inline-flex h-2 w-2 shrink-0', PILL_TONE[tone])}>
      {pulse && (
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-current opacity-70" />
      )}
      <span className="relative h-2 w-2 rounded-full bg-current" />
    </span>
  );
}

/* =================================== fields ================================= */

interface FieldWrapProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldWrap({ label, hint, error, required, children, className }: FieldWrapProps) {
  return (
    <div className={className}>
      {label && (
        <span className="label">
          {label}
          {required && <span className="ml-1 text-ember">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapClass?: string;
}

export function TextField({ label, hint, error, wrapClass, className, ...rest }: TextFieldProps) {
  const id = useId();
  return (
    <FieldWrap label={label} hint={hint} error={error} required={rest.required} className={wrapClass}>
      <input
        id={id}
        className={cx('field', error && 'border-danger/70', className)}
        {...rest}
      />
    </FieldWrap>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapClass?: string;
}

export function TextArea({ label, hint, error, wrapClass, className, ...rest }: TextAreaProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error} required={rest.required} className={wrapClass}>
      <textarea className={cx('field resize-y', error && 'border-danger/70', className)} {...rest} />
    </FieldWrap>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapClass?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({
  label,
  hint,
  error,
  wrapClass,
  options,
  placeholder,
  className,
  ...rest
}: SelectFieldProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error} required={rest.required} className={wrapClass}>
      <select className={cx('field appearance-none pr-9', className)} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
}

/* =================================== avatar ================================= */

export function Avatar({
  name,
  src,
  size = 36,
  tone = 'frost',
}: {
  name?: string;
  src?: string;
  size?: number;
  tone?: 'frost' | 'ember';
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name ?? ''}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cx(
        'grid shrink-0 place-items-center rounded-full border font-semibold',
        tone === 'frost'
          ? 'border-frost/25 bg-frost/10 text-frost'
          : 'border-ember/25 bg-ember/10 text-ember',
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}

/* ================================== feedback ================================ */

export function Alert({
  tone = 'info',
  title,
  children,
  onDismiss,
}: {
  tone?: 'info' | 'ok' | 'warn' | 'danger';
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
}) {
  const styles = {
    info: 'border-info/30 bg-info/[0.07] text-info',
    ok: 'border-ok/30 bg-ok/[0.07] text-ok',
    warn: 'border-warn/30 bg-warn/[0.07] text-warn',
    danger: 'border-danger/30 bg-danger/[0.07] text-danger',
  }[tone];
  const Icon = tone === 'danger' || tone === 'warn' ? IconAlert : tone === 'ok' ? IconCheck : IconInfo;

  return (
    <div className={cx('flex items-start gap-3 rounded-xl border px-4 py-3', styles)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1 text-[13px] leading-relaxed text-ink">
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        {children}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-muted hover:text-ink" aria-label="Dismiss">
          <IconX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {icon && (
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-sunken text-faint">
          {icon}
        </span>
      )}
      <p className="text-sm font-semibold">{title}</p>
      {children && <p className="max-w-sm text-[13px] leading-relaxed text-muted">{children}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cx('relative overflow-hidden rounded-lg bg-raised', className)}>
      <div className="absolute inset-y-0 w-1/3 animate-sweep bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
}

/* =================================== modal ================================== */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className={cx(
          'relative max-h-[88dvh] w-full animate-scale-in overflow-hidden rounded-2xl border border-line bg-surface shadow-deep',
          wide ? 'max-w-3xl' : 'max-w-lg',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h3 className="text-[15px] font-semibold">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-muted transition-colors hover:text-ink" aria-label="Close">
            <IconX className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="max-h-[62dvh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

/* =================================== toast ================================== */

export interface ToastMessage {
  id: number;
  tone: 'ok' | 'danger' | 'info';
  text: string;
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = (text: string, tone: ToastMessage['tone'] = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  };

  const view = (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            'pointer-events-auto flex animate-fade-up items-center gap-2.5 rounded-xl border px-4 py-2.5 text-[13px] shadow-deep backdrop-blur',
            t.tone === 'ok' && 'border-ok/35 bg-ok/10 text-ok',
            t.tone === 'danger' && 'border-danger/35 bg-danger/10 text-danger',
            t.tone === 'info' && 'border-info/35 bg-info/10 text-info',
          )}
        >
          {t.tone === 'ok' ? <IconCheck className="h-4 w-4" /> : <IconInfo className="h-4 w-4" />}
          <span className="text-ink">{t.text}</span>
        </div>
      ))}
    </div>
  );

  return { push, view };
}

/* =================================== tabs =================================== */

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string; count?: number }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cx(
              'relative whitespace-nowrap px-3.5 py-2.5 text-[13px] font-medium transition-colors',
              on ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={cx('ml-1.5 tnum text-xs', on ? 'text-frost' : 'text-faint')}>{t.count}</span>
            )}
            {on && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-thermal" />}
          </button>
        );
      })}
    </div>
  );
}

/* ================================ progress bar ============================== */

export function Meter({
  value,
  max = 100,
  tone = 'frost',
  className,
}: {
  value: number;
  max?: number;
  tone?: 'frost' | 'ember' | 'ok' | 'warn' | 'danger';
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  const bg = {
    frost: 'bg-frost',
    ember: 'bg-ember',
    ok: 'bg-ok',
    warn: 'bg-warn',
    danger: 'bg-danger',
  }[tone];

  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-sunken', className)}>
      <div
        className={cx('h-full rounded-full transition-[width] duration-700', bg)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
