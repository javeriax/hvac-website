import Link from 'next/link';
import { ReactNode } from 'react';
import { IconChevronRight } from '@/components/icons';

/** Shared inner-page header: breadcrumb, index mark, title, lede, optional aside. */
export function PageHero({
  index,
  eyebrow,
  title,
  lede,
  children,
  aside,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(44rem 24rem at 8% -20%, rgb(var(--c-frost) / 0.12), transparent 62%),' +
            'radial-gradient(38rem 22rem at 92% 10%, rgb(var(--c-ember) / 0.08), transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 py-14 lg:py-20">
        <nav className="mb-7 flex items-center gap-1.5 text-2xs text-faint" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-frost">
            Home
          </Link>
          <IconChevronRight className="h-3 w-3" />
          <span className="text-muted">{eyebrow}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              {index && <span className="index-mark">{index}</span>}
              {index && <span className="h-px w-6 bg-line" />}
              <span className="eyebrow">{eyebrow}</span>
            </div>
            <h1 className="max-w-3xl text-[clamp(2.1rem,5vw,3.4rem)] font-semibold leading-[1.03] tracking-[-0.03em]">
              {title}
            </h1>
            {lede && (
              <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-muted">{lede}</p>
            )}
            {children && <div className="mt-8">{children}</div>}
          </div>
          {aside && <div className="lg:justify-self-end">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
