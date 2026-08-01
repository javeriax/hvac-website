import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/site/PageHero';
import { TestimonialWall } from '@/components/site/TestimonialWall';
import { IconArrowRight, IconStar } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Customer Stories',
  description:
    'Reviews and customer stories from ArcticAir HVAC clients across the Phoenix metro — emergency repairs, installations, maintenance plans and commercial contracts.',
};

export default function TestimonialsPage() {
  return (
    <>
      <PageHero
        index="07"
        eyebrow="Customer Stories"
        title="Judged on the work, not the pitch"
        lede="Every review below comes from a completed job in our system. We publish the four-star ones too — a contractor with nothing but fives is a contractor curating."
        aside={
          <div className="rounded-card border border-line bg-surface p-6 text-center lg:w-[18rem]">
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar key={i} className="h-4 w-4 fill-current text-ember" />
              ))}
            </div>
            <p className="tnum mt-4 text-[38px] font-semibold leading-none">4.9</p>
            <p className="mt-2 text-[13px] text-muted">across 2,100+ reviews</p>
            <div className="mt-5 space-y-1.5 border-t border-line pt-4 text-left">
              {[
                ['5 star', 89],
                ['4 star', 8],
                ['3 star', 2],
                ['2 star or below', 1],
              ].map(([label, pct]) => (
                <div key={label as string} className="flex items-center gap-2.5">
                  <span className="w-24 text-2xs text-muted">{label}</span>
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-sunken">
                    <span
                      className="block h-full rounded-full bg-thermal"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="tnum w-8 text-right text-2xs text-faint">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <TestimonialWall />

        <div className="mt-14 rounded-card border border-line bg-surface p-8 text-center">
          <h2 className="text-[22px] font-semibold">Been a customer?</h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
            Every completed job in your portal has a feedback link. Honest criticism is more useful
            to us than another five stars.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn-ghost btn-sm">
              Sign in to leave feedback
            </Link>
            <Link href="/request-quote" className="btn-primary btn-sm">
              Request a quote
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
