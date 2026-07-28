type PageHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

/** Consistent banner used at the top of every inner (non-home) page. */
export default function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <section className="hero-glow relative overflow-hidden border-b border-stone-200 bg-brand-50">
      <div className="section-container relative py-16 sm:py-20">
        {eyebrow && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-clay-600">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl leading-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-600">{subtitle}</p>}
      </div>
    </section>
  );
}
