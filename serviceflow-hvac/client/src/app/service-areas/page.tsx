import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { SERVICE_AREAS } from "@/lib/data";
import { MapPinIcon, ClockIcon } from "@/components/icons";
import ServiceIconBadge from "@/components/ServiceIconBadge";

export const metadata: Metadata = { title: "Service Areas" };

export default function ServiceAreasPage() {
  return (
    <>
      <PageHero
        eyebrow="Service Areas"
        title="Where ArcticAir HVAC Solutions operates."
        subtitle="Response time depends on distance from the nearest dispatch hub."
      />

      <section className="section-container py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_AREAS.map((area, index) => (
            <div key={area.city} className="group card flex items-start justify-between">
              <div className="flex items-start gap-3">
                <ServiceIconBadge icon={MapPinIcon} index={index} size="sm" />
                <div>
                  <div className="font-medium text-brand-900">
                    {area.city}, {area.state}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {area.responseTime} response
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-10 flex flex-col items-start justify-between gap-4 bg-brand-50 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg">Don&apos;t see your city listed?</h2>
            <p className="mt-1 text-sm text-stone-600">
              Submit a request anyway — we cover surrounding areas on a case-by-case basis.
            </p>
          </div>
          <Link href="/request-quote" className="btn-primary shrink-0">
            Request a Quote
          </Link>
        </div>
      </section>
    </>
  );
}
