import Link from 'next/link';
import { ReactNode } from 'react';
import { Logo } from '@/components/brand';
import { IconCheck } from '@/components/icons';

/** Split layout shared by sign-in and registration. */
export function AuthShell({
  title,
  lede,
  children,
  footer,
  points,
}: {
  title: string;
  lede: string;
  children: ReactNode;
  footer: ReactNode;
  points: string[];
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(46rem 26rem at 6% -10%, rgb(var(--c-frost) / 0.13), transparent 62%),' +
            'radial-gradient(38rem 22rem at 96% 20%, rgb(var(--c-ember) / 0.09), transparent 60%)',
        }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        {/* narrative side */}
        <div className="hidden lg:block">
          <Logo size={34} />
          <h1 className="mt-9 max-w-md text-[clamp(2rem,3.6vw,2.8rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
            {title}
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">{lede}</p>

          <ul className="mt-9 space-y-3.5">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[14px]">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-frost/25 bg-frost/[0.08] text-frost">
                  <IconCheck className="h-3 w-3" />
                </span>
                <span className="text-muted">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* form side */}
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo size={30} />
          </div>

          <div className="rounded-card border border-line bg-surface p-7 shadow-lift sm:p-8">
            {children}
          </div>

          <div className="mt-5 text-center text-[13px] text-muted">{footer}</div>

          <p className="mt-8 text-center text-2xs leading-relaxed text-faint">
            By continuing you agree to our terms of service. Need help?{' '}
            <Link href="/contact" className="link-underline text-frost">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
