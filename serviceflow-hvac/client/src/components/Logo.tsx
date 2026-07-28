type LogoProps = {
  /** Show the wordmark next to the mark. Off for tight spaces (favicons, app icons). */
  withWordmark?: boolean;
  className?: string;
  /** Use light text for dark backgrounds (footer, dark navbar states). */
  variant?: "dark" | "light";
};

/**
 * ArcticAir HVAC Solutions mark: a circular badge with three stacked
 * chevrons (airflow / duct direction) in clay, ringed in warm charcoal --
 * reads as "climate + motion" without a literal snowflake/flame cliche.
 */
export default function Logo({ withWordmark = true, className = "", variant = "dark" }: LogoProps) {
  const textColor = variant === "dark" ? "text-brand-900" : "text-white";
  const subColor = variant === "dark" ? "text-stone-500" : "text-brand-200";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="18" cy="18" r="17" stroke="#423b32" strokeWidth="2" />
        <path d="M10 22L18 15L26 22" stroke="#e2633a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 16.5L18 9.5L26 16.5" stroke="#423b32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {withWordmark && (
        <div className="leading-tight">
          <div className={`text-lg font-bold tracking-tight ${textColor}`}>
            ArcticAir
          </div>
          <div className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${subColor}`}>
            HVAC Solutions
          </div>
        </div>
      )}
    </div>
  );
}
