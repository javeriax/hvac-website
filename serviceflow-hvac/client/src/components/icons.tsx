// Minimal hand-drawn line icon set (no external icon library dependency).
// Kept to exactly the icons the corporate site uses.

type IconProps = { className?: string };

const base = "stroke-current fill-none";

export function CheckIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2.5}>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7L6 21.5l1.6-7-5.4-4.7 7.1-.7L12 2.5z" />
    </svg>
  );
}

export function PhoneIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2}>
      <path
        d="M4 5c0 8.284 6.716 15 15 15l1-4-5-2-1.5 1.5A11.05 11.05 0 018 9.5L9.5 8 7.5 3 4 5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MapPinIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2}>
      <path d="M12 22s7-7.5 7-12.5a7 7 0 10-14 0C5 14.5 12 22 12 22z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function ClockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
    </svg>
  );
}

export function WrenchIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2}>
      <path
        d="M14.7 6.3a4 4 0 00-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 005.4-5.4l-2.6 2.6-2-.5-.5-2 2.1-2.1z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SnowflakeIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2}>
      <path d="M12 2v20M4.5 6l15 12M19.5 6l-15 12" strokeLinecap="round" />
    </svg>
  );
}

export function AlertIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2}>
      <path d="M12 3l10 18H2L12 3z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

export function WindIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2}>
      <path
        d="M3 8h11a2.5 2.5 0 100-5M3 16h14a2.5 2.5 0 110 5M3 12h8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThermometerIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2}>
      <path d="M12 4a2 2 0 00-2 2v8.3a3.5 3.5 0 102 0V6a2 2 0 00-2-2z" strokeLinejoin="round" />
    </svg>
  );
}

/** Maps a service slug (see lib/data.ts) to its icon component. */
export const SERVICE_ICONS: Record<string, (props: IconProps) => JSX.Element> = {
  installation: WrenchIcon,
  repair: WrenchIcon,
  emergency: AlertIcon,
  maintenance: CalendarIcon,
  "duct-cleaning": WindIcon,
  thermostat: ThermometerIcon,
};
