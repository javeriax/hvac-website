import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { MAINTENANCE_PLANS } from "@/lib/data";
import { CheckIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Maintenance Plans" };

export default function MaintenancePlansPage() {
  return (
    <>
      <PageHero
        eyebrow="Maintenance Plans"
        title="Scheduled maintenance instead of surprise breakdowns."
        subtitle="Annual contracts with seasonal visits, priority scheduling, and discounted repair labor."
      />

      <section className="section-container py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {MAINTENANCE_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card flex flex-col ${plan.highlighted ? "border-2 border-clay-400" : ""}`}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-block w-fit rounded-full bg-clay-100 px-3 py-1 text-xs font-semibold text-clay-700">
                  Most requested
                </span>
              )}
              <h2 className="text-lg">{plan.name}</h2>
              <p className="mt-1 text-sm text-stone-600">{plan.tagline}</p>
              <div className="mt-4 text-3xl font-bold text-brand-700">{plan.price}</div>
              <div className="mt-1 text-xs text-stone-500">
                {plan.visitsPerYear} visit{plan.visitsPerYear > 1 ? "s" : ""} / year
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-stone-700">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/request-quote"
                className={plan.highlighted ? "btn-accent mt-6" : "btn-primary mt-6"}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        <div className="card mt-10 bg-stone-50">
          <h2 className="text-lg">How renewals work</h2>
          <p className="mt-2 text-sm text-stone-600">
            Every plan is tracked from the day it starts. We send a renewal
            reminder before the contract expires and schedule the next visit
            automatically once it&apos;s renewed, so coverage never lapses
            without you knowing.
          </p>
        </div>
      </section>
    </>
  );
}
