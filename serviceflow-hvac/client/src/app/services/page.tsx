import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { SERVICES } from "@/lib/data";
import { SERVICE_ICONS, CheckIcon } from "@/components/icons";
import ServiceIconBadge from "@/components/ServiceIconBadge";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Installation, repair, and maintenance for every HVAC system."
        subtitle="Six core service lines covering residential and commercial equipment."
      />

      <section className="section-container py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {SERVICES.map((service, index) => {
            const Icon = SERVICE_ICONS[service.slug];
            const featured = service.slug === "emergency";
            return (
              <div
                key={service.slug}
                id={service.slug}
                className={`group card ${featured ? "border-brand-900 bg-brand-900 text-white" : ""}`}
              >
                <ServiceIconBadge icon={Icon} index={featured ? 1 : index} />
                <h2 className={`mt-4 text-lg ${featured ? "text-white" : ""}`}>{service.name}</h2>
                <p className={`mt-1.5 text-sm ${featured ? "text-brand-200" : "text-stone-600"}`}>
                  {service.summary}
                </p>
                <ul className="mt-4 space-y-2">
                  {service.details.map((detail) => (
                    <li
                      key={detail}
                      className={`flex items-start gap-2 text-sm ${featured ? "text-brand-100" : "text-stone-700"}`}
                    >
                      <CheckIcon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-clay-400" : "text-clay-500"}`}
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="card mt-10 flex flex-col items-start justify-between gap-4 bg-brand-50 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg">Not sure which service you need?</h2>
            <p className="mt-1 text-sm text-stone-600">
              Describe the issue on the quote form — our dispatcher will route it to the right technician.
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
