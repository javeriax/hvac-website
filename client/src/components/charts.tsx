'use client';

import { ReactNode, useId, useMemo, useState } from 'react';
import { compactMoney, cx, num } from '@/lib/format';

/**
 * Charts are hand-drawn SVG rather than a charting library. It keeps the bundle
 * small, but more importantly it lets every mark inherit the same theme tokens
 * as the rest of the product — so light/dark switching is free and the visual
 * language stays consistent with the dials and meters elsewhere.
 */

export interface Point {
  label: string;
  value: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

/* ------------------------------- area / line ------------------------------- */

export function AreaChart({
  data,
  height = 220,
  format = (v: number) => num(v),
  tone = 'frost',
}: {
  data: Point[];
  height?: number;
  format?: (v: number) => string;
  tone?: 'frost' | 'ember';
}) {
  const uid = useId().replace(/:/g, '');
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = height;
  const PAD = { top: 16, right: 8, bottom: 26, left: 46 };

  const { points, max, ticks } = useMemo(() => {
    const values = data.map((d) => d.value);
    const rawMax = Math.max(...values, 1);
    // Round the axis up to a friendly step so gridlines read cleanly.
    const magnitude = 10 ** Math.floor(Math.log10(rawMax));
    const niceMax = Math.ceil(rawMax / magnitude) * magnitude;

    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;

    return {
      max: niceMax,
      ticks: [0, 0.25, 0.5, 0.75, 1].map((t) => niceMax * t),
      points: data.map((d, i) => ({
        ...d,
        x: round(PAD.left + i * step),
        y: round(PAD.top + innerH - (d.value / niceMax) * innerH),
      })),
    };
  }, [data, H]);

  if (!data.length) return null;

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${points[points.length - 1].x} ${H - PAD.bottom} L ${points[0].x} ${H - PAD.bottom} Z`;
  const stroke = tone === 'frost' ? 'rgb(var(--c-frost))' : 'rgb(var(--c-ember))';
  const active = hover !== null ? points[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Trend chart">
        <defs>
          <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines + y axis */}
        {ticks.map((t) => {
          const y = round(PAD.top + (H - PAD.top - PAD.bottom) * (1 - t / max));
          return (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y}
                y2={y}
                stroke="rgb(var(--c-line))"
                strokeWidth="1"
                strokeDasharray={t === 0 ? undefined : '3 5'}
              />
              <text
                x={PAD.left - 8}
                y={y + 3.5}
                textAnchor="end"
                className="fill-[rgb(var(--c-faint))] font-mono"
                style={{ fontSize: 9 }}
              >
                {format(t)}
              </text>
            </g>
          );
        })}

        <path d={area} fill={`url(#fill-${uid})`} />
        <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* x labels + hover targets */}
        {points.map((p, i) => (
          <g key={p.label + i}>
            <text
              x={p.x}
              y={H - 8}
              textAnchor="middle"
              className={cx('font-mono', hover === i ? 'fill-[rgb(var(--c-ink))]' : 'fill-[rgb(var(--c-faint))]')}
              style={{ fontSize: 9 }}
            >
              {p.label}
            </text>
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === i ? 4.5 : 2.5}
              fill="rgb(var(--c-surface))"
              stroke={stroke}
              strokeWidth="2"
            />
            <rect
              x={p.x - 18}
              y={PAD.top}
              width="36"
              height={H - PAD.top - PAD.bottom}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'crosshair' }}
            />
          </g>
        ))}

        {active && (
          <line
            x1={active.x}
            x2={active.x}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke={stroke}
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity="0.6"
          />
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-surface px-2.5 py-1.5 shadow-lift"
          style={{ left: `${(active.x / W) * 100}%`, top: `${(active.y / H) * 100}%` }}
        >
          <p className="text-2xs uppercase tracking-[0.1em] text-faint">{active.label}</p>
          <p className="tnum text-[13px] font-semibold">{format(active.value)}</p>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- bars ---------------------------------- */

export function BarChart({
  data,
  height = 200,
  format = (v: number) => num(v),
  horizontal,
}: {
  data: Point[];
  height?: number;
  format?: (v: number) => string;
  horizontal?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (horizontal) {
    return (
      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div key={d.label} className="group">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="truncate text-[12.5px] capitalize text-muted">{d.label}</span>
              <span className="tnum shrink-0 text-[12.5px] font-semibold">{format(d.value)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(d.value / max) * 100}%`,
                  background: `linear-gradient(90deg, rgb(var(--c-frost)), rgb(var(--c-${
                    i === 0 ? 'ember' : 'frost-deep'
                  })))`,
                  transitionDelay: `${i * 60}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={d.label} className="group flex flex-1 flex-col items-center gap-2">
          <span className="tnum text-2xs font-semibold opacity-0 transition-opacity group-hover:opacity-100">
            {format(d.value)}
          </span>
          <div
            className="w-full rounded-t-md bg-thermal-soft transition-all duration-500 group-hover:bg-thermal"
            style={{
              height: `${Math.max((d.value / max) * (height - 44), 2)}px`,
              transitionDelay: `${i * 40}ms`,
            }}
          />
          <span className="font-mono text-[9px] text-faint">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- donut ---------------------------------- */

export function DonutChart({
  data,
  size = 168,
  thickness = 18,
  centerLabel,
  centerValue,
}: {
  data: (Point & { tone?: string })[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  const PALETTE = [
    'rgb(var(--c-frost))',
    'rgb(var(--c-ember))',
    'rgb(var(--c-info))',
    'rgb(var(--c-ok))',
    'rgb(var(--c-warn))',
    'rgb(var(--c-frost-deep))',
    'rgb(var(--c-danger))',
  ];

  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-7">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--c-sunken))"
          strokeWidth={thickness}
        />
        {data.map((d, i) => {
          const fraction = d.value / total;
          const dash = round(fraction * circumference);
          const el = (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.tone ?? PALETTE[i % PALETTE.length]}
              strokeWidth={hover === i ? thickness + 4 : thickness}
              strokeDasharray={`${dash} ${round(circumference - dash)}`}
              strokeDashoffset={-round(offset)}
              strokeLinecap="butt"
              className="transition-all duration-300"
              opacity={hover === null || hover === i ? 1 : 0.35}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            />
          );
          offset += dash;
          return el;
        })}

        {(centerValue || centerLabel) && (
          <g transform={`rotate(90 ${size / 2} ${size / 2})`}>
            <text
              x={size / 2}
              y={size / 2 - 2}
              textAnchor="middle"
              className="fill-[rgb(var(--c-ink))] font-mono"
              style={{ fontSize: 22, fontWeight: 600 }}
            >
              {hover !== null ? data[hover].value : centerValue}
            </text>
            <text
              x={size / 2}
              y={size / 2 + 15}
              textAnchor="middle"
              className="fill-[rgb(var(--c-faint))] font-mono"
              style={{ fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase' }}
            >
              {hover !== null ? data[hover].label : centerLabel}
            </text>
          </g>
        )}
      </svg>

      <ul className="min-w-0 flex-1 space-y-2">
        {data.map((d, i) => (
          <li
            key={d.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={cx(
              'flex items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors',
              hover === i && 'bg-raised',
            )}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: d.tone ?? PALETTE[i % PALETTE.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-[12.5px] capitalize text-muted">
              {d.label}
            </span>
            <span className="tnum shrink-0 text-[12.5px] font-semibold">{d.value}</span>
            <span className="tnum w-10 shrink-0 text-right text-2xs text-faint">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------- sparkline ------------------------------- */

export function Sparkline({
  data,
  width = 92,
  height = 26,
  tone = 'frost',
}: {
  data: number[];
  width?: number;
  height?: number;
  tone?: 'frost' | 'ember' | 'ok' | 'danger';
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const step = width / (data.length - 1);

  const d = data
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${round(i * step)} ${round(height - ((v - min) / span) * height)}`)
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke={`rgb(var(--c-${tone}))`}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------- stat tile ------------------------------- */

export function StatTile({
  label,
  value,
  delta,
  hint,
  icon,
  tone = 'frost',
  spark,
  href,
}: {
  label: string;
  value: ReactNode;
  delta?: number;
  hint?: string;
  icon?: ReactNode;
  tone?: 'frost' | 'ember' | 'ok' | 'warn' | 'danger' | 'info';
  spark?: number[];
  href?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  const Wrapper = href ? 'a' : 'div';

  return (
    <Wrapper
      {...(href ? { href } : {})}
      className={cx(
        'group relative overflow-hidden rounded-card border border-line bg-surface p-5 transition-colors',
        href && 'hover:border-frost/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-faint">{label}</p>
        {icon && (
          <span
            className={cx(
              'grid h-8 w-8 shrink-0 place-items-center rounded-lg border',
              tone === 'ember'
                ? 'border-ember/25 bg-ember/[0.08] text-ember'
                : tone === 'ok'
                  ? 'border-ok/25 bg-ok/[0.08] text-ok'
                  : tone === 'warn'
                    ? 'border-warn/25 bg-warn/[0.08] text-warn'
                    : tone === 'danger'
                      ? 'border-danger/25 bg-danger/[0.08] text-danger'
                      : tone === 'info'
                        ? 'border-info/25 bg-info/[0.08] text-info'
                        : 'border-frost/25 bg-frost/[0.08] text-frost',
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <p className="tnum mt-3 text-[27px] font-semibold leading-none">{value}</p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {delta !== undefined && (
            <span
              className={cx(
                'tnum inline-flex items-center gap-1 text-[12px] font-semibold',
                positive ? 'text-ok' : 'text-danger',
              )}
            >
              {positive ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          {hint && <p className="mt-0.5 truncate text-2xs text-muted">{hint}</p>}
        </div>
        {spark && <Sparkline data={spark} tone={tone === 'ember' ? 'ember' : 'frost'} />}
      </div>
    </Wrapper>
  );
}

export { compactMoney };
