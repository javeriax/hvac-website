import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { ShieldIcon, ClockIcon, CheckIcon, WrenchIcon } from "@/components/icons";
import ServiceIconBadge from "@/components/ServiceIconBadge";

export const metadata: Metadata = { title: "About Us" };

const VALUES = [
  {
    icon: ShieldIcon,
    title: "Accountability",
    body: "Every job is tied to a technician, a report, and a signature — nothing gets lost between the office and the field.",
  },
  {
    icon: ClockIcon,
    title: "Response time",
    body: "Dispatch is built around minimizing the gap between a customer calling and a technician arriving.",
  },
  {
    icon: CheckIcon,
    title: "Transparent pricing",
    body: "Quotes are itemized by labor and equipment before work starts. No line items appear after the fact.",
  },
  {
    icon: WrenchIcon,
    title: "Trained technicians",
    body: "Technicians are certified and trained across major residential and commercial HVAC brands.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="A regional HVAC company built around reliable dispatch."
        subtitle="ArcticAir HVAC Solutions provides installation, repair, emergency service, and maintenance contracts for residential and commercial customers."
      />

      <section className="section-container py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl">Our story</h2>
            <p className="mt-3 text-stone-600">
              ArcticAir HVAC Solutions started as a small residential repair
              outfit and has grown into a 35-plus technician operation serving
              both homes and commercial properties across multiple cities. As
              the customer base grew, so did the need for a proper system to
              manage requests, quotes, technician schedules, and maintenance
              contracts — which is what this platform was built to solve.
            </p>
            <p className="mt-4 text-stone-600">
              We work on all major HVAC brands, not just the equipment we
              install, so switching to us doesn&apos;t mean replacing your
              system.
            </p>
          </div>
          <div>
            <h2 className="text-2xl">What we cover</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-stone-700">
              <li>Residential and commercial installation</li>
              <li>Repair for all major HVAC brands</li>
              <li>24/7 emergency service</li>
              <li>Annual maintenance contracts</li>
              <li>Duct cleaning and thermostat installation</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-stone-50">
        <div className="section-container py-20">
          <h2 className="text-2xl">What we hold ourselves to</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, index) => (
              <div key={value.title} className="group">
                <ServiceIconBadge icon={value.icon} index={index} />
                <h3 className="mt-4 text-base">{value.title}</h3>
                <p className="mt-1.5 text-sm text-stone-600">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
