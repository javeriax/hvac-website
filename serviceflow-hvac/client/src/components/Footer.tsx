import Link from "next/link";
import Logo from "./Logo";

const SERVICE_LINKS = [
  { href: "/services", label: "Installation & Repair" },
  { href: "/maintenance-plans", label: "Maintenance Plans" },
  { href: "/emergency-services", label: "Emergency Services" },
  { href: "/service-areas", label: "Service Areas" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-brand-900">
      <div className="section-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-200">
            Residential and commercial HVAC installation, repair, and maintenance
            across multiple service areas.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Services</h3>
          <ul className="mt-4 space-y-2.5">
            {SERVICE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-brand-200 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Company</h3>
          <ul className="mt-4 space-y-2.5">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-brand-200 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-brand-200">
            <li>24/7 Emergency Line: (555) 010-2044</li>
            <li>support@arcticairhvac.com</li>
            <li>Mon–Sat: 7:00 AM – 8:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-800">
        <div className="section-container flex flex-col items-center justify-between gap-2 py-5 text-xs text-brand-300 sm:flex-row">
          <p>© {year} ArcticAir HVAC Solutions. All rights reserved.</p>
          <p>Licensed & insured HVAC contractor.</p>
        </div>
      </div>
    </footer>
  );
}
