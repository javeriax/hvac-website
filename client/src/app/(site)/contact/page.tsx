import type { Metadata } from 'next';
import { PageHero } from '@/components/site/PageHero';
import { ContactForm } from '@/components/site/ContactForm';
import { IconClock, IconMail, IconMapPin, IconPhone } from '@/components/icons';
import { COMPANY, SERVICE_AREAS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Reach ArcticAir HVAC Solutions — office line, 24/7 emergency dispatch, email and our Phoenix headquarters.',
};

const CHANNELS = [
  {
    icon: IconPhone,
    label: 'Office line',
    value: COMPANY.phone,
    href: `tel:${COMPANY.phone.replace(/\D/g, '')}`,
    note: 'Mon–Sat, 7:00am – 7:00pm',
  },
  {
    icon: IconPhone,
    label: 'Emergency dispatch',
    value: COMPANY.emergencyPhone,
    href: `tel:${COMPANY.emergencyPhone.replace(/\D/g, '')}`,
    note: '24 hours, every day',
    urgent: true,
  },
  {
    icon: IconMail,
    label: 'Email',
    value: COMPANY.email,
    href: `mailto:${COMPANY.email}`,
    note: 'Replies within one business day',
  },
  {
    icon: IconMapPin,
    label: 'Head office',
    value: COMPANY.address,
    note: 'Visitor parking in the rear lot',
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        index="06"
        eyebrow="Contact"
        title="Talk to a person, not a form robot"
        lede="Every message lands in the same dashboard our dispatchers work from. If it is urgent, call the emergency line — that one always reaches a human."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          {/* channels */}
          <div className="space-y-3">
            {CHANNELS.map((c) => {
              const body = (
                <>
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                      c.urgent
                        ? 'border-ember/30 bg-ember/10 text-ember'
                        : 'border-line bg-sunken text-frost'
                    }`}
                  >
                    <c.icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-2xs uppercase tracking-[0.14em] text-faint">{c.label}</p>
                    <p
                      className={`mt-1 break-words text-[14.5px] font-medium ${
                        c.urgent ? 'tnum text-ember' : ''
                      }`}
                    >
                      {c.value}
                    </p>
                    <p className="mt-1 text-2xs text-muted">{c.note}</p>
                  </div>
                </>
              );

              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  className="flex items-start gap-4 rounded-card border border-line bg-surface p-5 transition-colors hover:border-frost/30"
                >
                  {body}
                </a>
              ) : (
                <div key={c.label} className="flex items-start gap-4 rounded-card border border-line bg-surface p-5">
                  {body}
                </div>
              );
            })}

            <div className="rounded-card border border-line bg-surface p-5">
              <p className="flex items-center gap-2 text-2xs uppercase tracking-[0.14em] text-faint">
                <IconClock className="h-3.5 w-3.5" />
                Coverage
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {SERVICE_AREAS.map((a) => (
                  <span
                    key={a.city}
                    className="rounded-md bg-raised px-2 py-1 text-2xs text-muted"
                  >
                    {a.city}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* form */}
          <ContactForm />
        </div>
      </section>
    </>
  );
}
