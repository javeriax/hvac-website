import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { PhoneIcon, ClockIcon, CheckIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Emergency Services" };

const EMERGENCY_SIGNS = [
  "No heat or no cooling in extreme weather",
  "Burning smell or visible sparks from the unit",
  "Gas smell near a furnace",
  "Water leaking from an indoor unit",
  "System making a loud grinding or banging noise",
];

export default function EmergencyServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Emergency Services"
        title="24/7 emergency response for heating and cooling failures."
        subtitle="Emergency calls are prioritized ahead of standard scheduling."
      />

      <section className="section-container py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="card border-2 border-clay-400 bg-clay-50">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-clay-400 text-white">
                  <PhoneIcon />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-clay-700">
                    24/7 Emergency Line
                  </div>
                  <div className="text-xl font-bold text-brand-900">(555) 010-2044</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-stone-700">
                Call directly for an active emergency. For non-urgent issues,
                submitting a service request online is usually faster than
                waiting on hold.
              </p>
            </div>

            <div className="card mt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <ClockIcon />
              </div>
              <h2 className="mt-4 text-lg">What to expect</h2>
              <ul className="mt-3 space-y-2.5 text-sm text-stone-700">
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  Dispatcher confirms the issue and your location
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  Nearest available technician is assigned immediately
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  Diagnostics and, where possible, repair happen in the same visit
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-lg">When to treat it as an emergency</h2>
            <ul className="mt-4 space-y-3">
              {EMERGENCY_SIGNS.map((sign) => (
                <li key={sign} className="card flex items-start gap-3 py-4">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-clay-500" />
                  <span className="text-sm text-stone-700">{sign}</span>
                </li>
              ))}
            </ul>
            <Link href="/request-quote" className="btn-primary mt-6 inline-flex">
              Submit a Non-Urgent Request
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
