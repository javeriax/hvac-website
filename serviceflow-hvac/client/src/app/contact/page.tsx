import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { PhoneIcon, MailIcon, ClockIcon, MapPinIcon } from "@/components/icons";
import ServiceIconBadge from "@/components/ServiceIconBadge";

export const metadata: Metadata = { title: "Contact" };

const CONTACT_DETAILS = [
  { icon: PhoneIcon, label: "Phone", value: "(555) 010-2044" },
  { icon: MailIcon, label: "Email", value: "support@arcticairhvac.com" },
  { icon: ClockIcon, label: "Hours", value: "Mon–Sat, 7:00 AM – 8:00 PM" },
  { icon: MapPinIcon, label: "Coverage", value: "6 cities — see Service Areas" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch."
        subtitle="For active emergencies, call the 24/7 line directly instead of using this form."
      />

      <section className="section-container py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-5">
            {CONTACT_DETAILS.map((item, index) => (
              <div key={item.label} className="group card flex items-start gap-3">
                <ServiceIconBadge icon={item.icon} index={index} size="sm" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    {item.label}
                  </div>
                  <div className="mt-0.5 text-sm font-medium text-brand-900">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
