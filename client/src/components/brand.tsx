'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { cx } from '@/lib/format';

/* ==================================== logo =================================== */

/**
 * Company mark. The hexagon is a duct cross-section and the gradient splits
 * cool/warm, which is the whole business in one shape. Still readable at 20px.
 */
export function Logo({
  size = 30,
  withWordmark = true,
  href = '/',
}: {
  size?: number;
  withWordmark?: boolean;
  href?: string | null;
}) {
  const mark = (
    <span className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
        <defs>
          <linearGradient id="sf-thermal" x1="4" y1="34" x2="36" y2="6">
            <stop offset="0%" stopColor="rgb(var(--c-frost))" />
            <stop offset="100%" stopColor="rgb(var(--c-ember))" />
          </linearGradient>
        </defs>
        <path
          d="M20 2.6 34.4 11v18L20 37.4 5.6 29V11Z"
          stroke="url(#sf-thermal)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M20 11.4 27.6 15.8v8.4L20 28.6l-7.6-4.4v-8.4Z"
          fill="url(#sf-thermal)"
          fillOpacity="0.22"
        />
        <path d="M20 11.4v17.2" stroke="url(#sf-thermal)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12.4 15.8 20 20l7.6-4.2" stroke="url(#sf-thermal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">
            Arctic<span className="thermal-text">Air</span>
          </span>
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.24em] text-faint">
            ServiceFlow
          </span>
        </span>
      )}
    </span>
  );

  return href ? (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="ArcticAir HVAC, home">
      {mark}
    </Link>
  ) : (
    mark
  );
}

/* =================================== grain =================================== */

/** Fixed film-grain layer. Purely decorative, sits above the grid, below content. */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] mix-blend-overlay"
      style={{
        opacity: 'var(--grain-opacity)',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

/* =============================== thermostat dial ============================= */

const DIAL_MIN = 58;
const DIAL_MAX = 88;
const ARC_SPAN = 264; // degrees of travel
const ARC_START = 138; // where the arc begins, measured clockwise from 3 o'clock

/** Rounded so server and client render byte-identical coordinates (no hydration drift). */
function polar(cx0: number, cy0: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return { x: round(cx0 + r * Math.cos(rad)), y: round(cy0 + r * Math.sin(rad)) };
}

function arcPath(cx0: number, cy0: number, r: number, fromDeg: number, toDeg: number) {
  const a = polar(cx0, cy0, r, fromDeg);
  const b = polar(cx0, cy0, r, toDeg);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

/**
 * The thermostat dial in the homepage hero.
 *
 * Left alone it loops a slow cool-down. As soon as someone drags it the loop
 * stops and it follows the pointer instead. Arrow keys work too, so it is not
 * mouse-only.
 */
export function ThermostatDial({ className }: { className?: string }) {
  const [temp, setTemp] = useState(78);
  const [interacting, setInteracting] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  // Idle animation: drift from a hot house down to setpoint, then start over.
  useEffect(() => {
    if (interacting) return undefined;
    const id = setInterval(() => {
      setTemp((t) => (t <= 68.2 ? 84 : t - 0.35));
    }, 90);
    return () => clearInterval(id);
  }, [interacting]);

  const pct = (temp - DIAL_MIN) / (DIAL_MAX - DIAL_MIN);
  const angle = ARC_START + pct * ARC_SPAN;
  const mode = temp > 74 ? 'cooling' : temp < 66 ? 'heating' : 'holding';

  const setFromPointer = (clientX: number, clientY: number) => {
    const svg = ref.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    const travelled = (deg - ARC_START + 360) % 360;
    if (travelled > ARC_SPAN) return; // pointer is in the dial's dead zone
    setTemp(DIAL_MIN + (travelled / ARC_SPAN) * (DIAL_MAX - DIAL_MIN));
  };

  const knob = polar(100, 100, 78, angle);

  return (
    <div className={cx('relative select-none', className)}>
      {/* ambient bloom */}
      <div
        className="pointer-events-none absolute inset-0 blur-3xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgb(var(--c-${
            mode === 'heating' ? 'ember' : 'frost'
          }) / 0.28), transparent 62%)`,
        }}
      />

      <svg
        ref={ref}
        viewBox="0 0 200 200"
        className="relative w-full cursor-grab touch-none active:cursor-grabbing"
        role="slider"
        aria-label="Target temperature"
        aria-valuemin={DIAL_MIN}
        aria-valuemax={DIAL_MAX}
        aria-valuenow={Math.round(temp)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') setTemp((t) => Math.min(DIAL_MAX, t + 1));
          if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') setTemp((t) => Math.max(DIAL_MIN, t - 1));
        }}
        onPointerDown={(e) => {
          setInteracting(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) setFromPointer(e.clientX, e.clientY);
        }}
        onPointerUp={() => setInteracting(false)}
        onPointerLeave={() => setInteracting(false)}
      >
        <defs>
          <linearGradient id="dial-track" x1="0" y1="200" x2="200" y2="0">
            <stop offset="0%" stopColor="rgb(var(--c-frost))" />
            <stop offset="55%" stopColor="rgb(var(--c-frost))" />
            <stop offset="100%" stopColor="rgb(var(--c-ember))" />
          </linearGradient>
          <filter id="dial-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* tick ring, 44 graduations around the travel */}
        {Array.from({ length: 45 }).map((_, i) => {
          const t = i / 44;
          const deg = ARC_START + t * ARC_SPAN;
          const major = i % 5 === 0;
          const lit = t <= pct;
          const a = polar(100, 100, major ? 88 : 90, deg);
          const b = polar(100, 100, 95, deg);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={lit ? 'url(#dial-track)' : 'rgb(var(--c-line))'}
              strokeWidth={major ? 2 : 1}
              strokeLinecap="round"
              opacity={lit ? 1 : 0.55}
            />
          );
        })}

        {/* track + progress */}
        <path
          d={arcPath(100, 100, 78, ARC_START, ARC_START + ARC_SPAN)}
          stroke="rgb(var(--c-line))"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={arcPath(100, 100, 78, ARC_START, Math.max(ARC_START + 0.5, angle))}
          stroke="url(#dial-track)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          filter="url(#dial-glow)"
        />

        {/* knob */}
        <circle cx={knob.x} cy={knob.y} r="7.5" fill="rgb(var(--c-surface))" stroke="url(#dial-track)" strokeWidth="3" />

        {/* readout */}
        <text
          x="100"
          y="98"
          textAnchor="middle"
          className="fill-[rgb(var(--c-ink))] font-mono"
          style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.04em' }}
        >
          {Math.round(temp)}
          <tspan style={{ fontSize: 18 }} dy="-14">
            °F
          </tspan>
        </text>
        <text
          x="100"
          y="122"
          textAnchor="middle"
          className="fill-[rgb(var(--c-muted))] font-mono"
          style={{ fontSize: 8.5, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >
          {mode}
        </text>
        <text
          x="100"
          y="140"
          textAnchor="middle"
          className="fill-[rgb(var(--c-faint))] font-mono"
          style={{ fontSize: 7, letterSpacing: '0.18em' }}
        >
          SCOTTSDALE · UNIT 01
        </text>
      </svg>
    </div>
  );
}

/* =============================== section heading ============================= */

export function SectionHeading({
  index,
  eyebrow,
  title,
  children,
  align = 'left',
  action,
}: {
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  align?: 'left' | 'center';
  action?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'md:flex-col md:items-center',
      )}
    >
      <div className={cx('max-w-2xl', align === 'center' && 'text-center')}>
        {(index || eyebrow) && (
          <div className={cx('mb-3 flex items-center gap-3', align === 'center' && 'justify-center')}>
            {index && <span className="index-mark">{index}</span>}
            {index && eyebrow && <span className="h-px w-6 bg-line" />}
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          </div>
        )}
        <h2 className="text-[clamp(1.7rem,3.6vw,2.6rem)] font-semibold leading-[1.1]">{title}</h2>
        {children && (
          <p className={cx('mt-4 text-[15px] leading-relaxed text-muted', align === 'center' && 'mx-auto')}>
            {children}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ============================== reveal on scroll ============================= */

/** Fades content up the first time it enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cx('transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]', className)}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(18px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
