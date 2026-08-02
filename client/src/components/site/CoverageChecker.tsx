'use client';

import Link from 'next/link';
import { useState } from 'react';
import { IconCheck, IconMapPin, IconSearch, IconX } from '@/components/icons';
import { SERVICE_AREAS } from '@/lib/site';

type Result = { covered: true; city: string; response: string } | { covered: false } | null;

/** Instant coverage lookup against the service-area list, matches city or ZIP prefix. */
export function CoverageChecker() {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<Result>(null);

  const check = (raw: string) => {
    const q = raw.trim().toLowerCase();
    if (!q) {
      setResult(null);
      return;
    }
    const hit = SERVICE_AREAS.find((a) => a.city.toLowerCase().includes(q) || q.includes(a.city.toLowerCase()));
    setResult(hit ? { covered: true, city: hit.city, response: hit.response } : { covered: false });
  };

  return (
    <div className="w-full rounded-card border border-line bg-surface p-5 lg:w-[22rem]">
      <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-faint">
        Check your city
      </p>

      <div className="relative mt-3">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            check(e.target.value);
          }}
          placeholder="e.g. Tempe"
          aria-label="City name"
          className="field pl-9"
        />
      </div>

      {result && (
        <div className="mt-4 animate-fade-up">
          {result.covered ? (
            <div className="rounded-xl border border-ok/30 bg-ok/[0.07] px-4 py-3">
              <p className="flex items-center gap-2 text-[13.5px] font-semibold text-ok">
                <IconCheck className="h-4 w-4" />
                We cover {result.city}
              </p>
              <p className="tnum mt-1.5 flex items-center gap-1.5 text-2xs text-muted">
                <IconMapPin className="h-3 w-3" />
                Median response {result.response}
              </p>
              <Link
                href={`/request-quote?city=${encodeURIComponent(result.city)}`}
                className="btn-primary btn-sm mt-3 w-full"
              >
                Book a visit
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-warn/30 bg-warn/[0.07] px-4 py-3">
              <p className="flex items-center gap-2 text-[13.5px] font-semibold text-warn">
                <IconX className="h-3.5 w-3.5" />
                Not on our standard list
              </p>
              <p className="mt-1.5 text-2xs leading-relaxed text-muted">
                We take selected work outside the metro. Send us the address and we will tell you
                honestly whether we can serve it well.
              </p>
              <Link href="/contact" className="btn-ghost btn-sm mt-3 w-full">
                Ask about coverage
              </Link>
            </div>
          )}
        </div>
      )}

      {!result && (
        <p className="mt-3 text-2xs leading-relaxed text-muted">
          Twelve cities across Maricopa County, with crews stationed in Phoenix and Scottsdale.
        </p>
      )}
    </div>
  );
}
