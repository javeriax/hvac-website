import { cx, serviceLabel } from '@/lib/format';

/**
 * Two-letter tag shown wherever a service type appears in a table or list.
 *
 * This replaced the per-service icons. A monogram scans just as fast in a dense
 * table and it keeps colour meaning exactly one thing: orange is an emergency,
 * blue is everything else.
 */
const MONOGRAM: Record<string, string> = {
  installation: 'IN',
  repair: 'RP',
  maintenance: 'MT',
  inspection: 'IS',
  'duct-cleaning': 'DC',
  thermostat: 'TH',
  emergency: 'EM',
};

export function ServiceMark({
  type,
  size = 36,
  className,
}: {
  type?: string;
  size?: number;
  className?: string;
}) {
  const urgent = type === 'emergency';
  const label = MONOGRAM[type ?? ''] ?? '··';

  return (
    <span
      title={serviceLabel(type)}
      aria-label={serviceLabel(type)}
      className={cx(
        'grid shrink-0 place-items-center rounded-lg border font-mono font-semibold tracking-[0.04em]',
        urgent
          ? 'border-ember/30 bg-ember/[0.09] text-ember'
          : 'border-frost/25 bg-frost/[0.07] text-frost',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.32) }}
    >
      {label}
    </span>
  );
}
