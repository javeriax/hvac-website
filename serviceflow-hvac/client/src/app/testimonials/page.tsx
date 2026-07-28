import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { TESTIMONIALS } from "@/lib/data";
import { StarIcon } from "@/components/icons";
import Avatar from "@/components/Avatar";

export const metadata: Metadata = { title: "Testimonials" };

export default function TestimonialsPage() {
  return (
    <>
      <PageHero eyebrow="Testimonials" title="What our customers say." />

      <section className="texture-dots">
        <div className="section-container py-20">
          <div className="grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card bg-white/90 backdrop-blur-sm">
                <div className="flex gap-0.5 text-clay-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <p className="mt-3 text-sm text-stone-700">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <Avatar name={t.name} className="h-10 w-10 text-sm" />
                  <div>
                    <div className="text-sm font-medium text-brand-900">{t.name}</div>
                    <div className="text-xs text-stone-500">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
