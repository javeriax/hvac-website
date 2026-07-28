"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/maintenance-plans", label: "Maintenance Plans" },
  { href: "/emergency-services", label: "Emergency Services" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="section-container flex h-16 items-center justify-between">
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-600 transition-colors hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/track-request" className="text-sm font-medium text-stone-600 hover:text-brand-700">
            Track Request
          </Link>
          <Link href="/request-quote" className="btn-primary">
            Request a Quote
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-stone-700 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7H20M4 12H20M4 17H20" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-stone-200 bg-white lg:hidden">
          <div className="section-container flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/track-request"
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Track Request
            </Link>
            <Link
              href="/request-quote"
              onClick={() => setMenuOpen(false)}
              className="btn-primary mt-2"
            >
              Request a Quote
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
