import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ServiceRequestForm from "@/components/ServiceRequestForm";
import { ClockIcon, CheckIcon, ShieldIcon } from "@/components/icons";
import ServiceIconBadge from "@/components/ServiceIconBadge";

export const metadata: Metadata = { title: "Request a Quote" };

const REASSURANCES = [
  { icon: ClockIcon, text: "Quotes typically returned within one business day" },
  { icon: CheckIcon, text: "Itemized labor and equipment costs, no hidden fees" },
  { icon: ShieldIcon, text: "No obligation — accept or decline once you see the price" },
];

export default function RequestQuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Request a Quote"
        title="Tell us what's going on, we'll take it from there."
        subtitle="Submit the details below and a dispatcher will review your request. You'll get a tracking code to follow its status."
      />

      <section className="section-container py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <ul className="space-y-4">
              {REASSURANCES.map((item, index) => (
                <li key={item.text} className="group flex items-center gap-3">
                  <ServiceIconBadge icon={item.icon} index={index} size="sm" />
                  <span className="text-sm text-stone-700">{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="card mt-8 bg-clay-50">
              <p className="text-sm text-stone-700">
                For no-heat, no-cool, or active emergencies, call the 24/7 line
                instead of using this form — see{" "}
                <a href="/emergency-services" className="font-medium text-brand-700 hover:underline">
                  Emergency Services
                </a>
                .
              </p>
            </div>
          </div>

          <ServiceRequestForm />
        </div>
      </section>
    </>
  );
}
