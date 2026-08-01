import { ServiceType } from './types';

export const COMPANY = {
  name: 'ArcticAir HVAC Solutions',
  short: 'ArcticAir',
  product: 'ServiceFlow',
  tagline: 'Climate control, under control.',
  phone: '(602) 555-0142',
  emergencyPhone: '(602) 555-0911',
  email: 'service@arcticair.com',
  address: '2200 E Camelback Rd, Suite 410, Phoenix, AZ 85016',
  hours: 'Mon–Sat 7:00am – 7:00pm · Emergency line 24/7',
  founded: 2009,
  employees: 35,
  license: 'ROC #341207 · Bonded & Insured',
};

export interface ServiceDef {
  slug: ServiceType;
  name: string;
  short: string;
  description: string;
  bullets: string[];
  startingAt: string;
  duration: string;
  mode: 'cool' | 'heat' | 'both';
}

export const SERVICES: ServiceDef[] = [
  {
    slug: 'installation',
    name: 'System Installation',
    short: 'New systems, sized properly.',
    description:
      'Full replacement and new-build installation for split systems, packaged units, heat pumps and mini splits. Every quote starts with a load calculation and a duct assessment — not a guess based on the box already on your pad.',
    bullets: [
      'Manual J load calculation before sizing',
      'Duct static pressure verified on commissioning',
      'Old equipment removal and haul-away included',
      'Manufacturer rebate paperwork filed for you',
      '10-year parts warranty on qualifying systems',
    ],
    startingAt: '$3,200',
    duration: '1–2 days',
    mode: 'both',
  },
  {
    slug: 'repair',
    name: 'Diagnostics & Repair',
    short: 'Find the fault, not the symptom.',
    description:
      'Component-level troubleshooting on any residential or light-commercial system. We measure before we quote, and the diagnostic fee is credited against the repair if you approve the work.',
    bullets: [
      'Full electrical, refrigerant and airflow diagnostic',
      'Written findings with meter readings, not opinions',
      'Diagnostic fee credited toward approved repairs',
      'Most common parts carried on every van',
      '90-day labour warranty on all repairs',
    ],
    startingAt: '$95',
    duration: '1–4 hours',
    mode: 'both',
  },
  {
    slug: 'maintenance',
    name: 'Preventive Maintenance',
    short: 'The visit that prevents the call-out.',
    description:
      'A 21-point precision tune-up that catches the capacitor drift, coil fouling and drain blockage that turn into a July emergency. Included free on every maintenance plan.',
    bullets: [
      '21-point inspection with recorded readings',
      'Coil clean, drain flush and filter replacement',
      'Refrigerant charge verified against superheat',
      'Thermostat calibration and control check',
      'Photographic report delivered to your portal',
    ],
    startingAt: '$129',
    duration: '60–90 min',
    mode: 'both',
  },
  {
    slug: 'inspection',
    name: 'Inspection & Reporting',
    short: 'An honest second opinion.',
    description:
      'Independent condition assessments for property purchases, insurance claims, warranty disputes and second opinions on someone else\'s replacement quote.',
    bullets: [
      'Written condition report with remaining service life',
      'Static pressure and airflow measurement',
      'Photo documentation of every finding',
      'Suitable for real-estate inspection periods',
      'No sales pitch attached to the findings',
    ],
    startingAt: '$180',
    duration: '2–3 hours',
    mode: 'both',
  },
  {
    slug: 'duct-cleaning',
    name: 'Duct Cleaning & Air Quality',
    short: 'What you breathe, measured.',
    description:
      'NADCA-method source removal for the whole duct system, plus air quality assessment and filtration upgrades for households with allergy or asthma concerns.',
    bullets: [
      'Negative-pressure source removal, not just vacuuming',
      'Before-and-after camera footage of every run',
      'Register and plenum sanitising',
      'Duct leakage testing and sealing options',
      'MERV 13–16 media filter upgrade available',
    ],
    startingAt: '$420',
    duration: '4–6 hours',
    mode: 'both',
  },
  {
    slug: 'thermostat',
    name: 'Smart Controls',
    short: 'Controls that actually get used.',
    description:
      'Smart and programmable thermostat supply, installation and configuration — including zoning controls and multi-stage equipment wiring that most handymen get wrong.',
    bullets: [
      'Correct wiring for multi-stage and heat-pump equipment',
      'C-wire installation where missing',
      'App setup, scheduling and geofencing configured',
      'Zoning and remote sensor placement',
      'Walkthrough before we leave — every time',
    ],
    startingAt: '$149',
    duration: '1–2 hours',
    mode: 'both',
  },
  {
    slug: 'emergency',
    name: '24/7 Emergency Response',
    short: 'When it cannot wait until Monday.',
    description:
      'Round-the-clock response for total system failure, gas smells, water damage and commercial refrigeration. Plan members get a guaranteed response window; everyone else gets the next available van.',
    bullets: [
      'Live dispatch 24 hours a day, every day',
      '4-hour guaranteed response for Elite members',
      'Gas leak and electrical safety response',
      'Commercial refrigeration and walk-in coolers',
      'Temporary cooling equipment available',
    ],
    startingAt: '$165',
    duration: 'Same day',
    mode: 'both',
  },
];

export const SERVICE_AREAS = [
  { city: 'Phoenix', state: 'AZ', response: '2 hrs', techs: 8, flagship: true },
  { city: 'Scottsdale', state: 'AZ', response: '2 hrs', techs: 6, flagship: true },
  { city: 'Mesa', state: 'AZ', response: '3 hrs', techs: 5 },
  { city: 'Tempe', state: 'AZ', response: '2 hrs', techs: 4 },
  { city: 'Chandler', state: 'AZ', response: '3 hrs', techs: 4 },
  { city: 'Gilbert', state: 'AZ', response: '3 hrs', techs: 3 },
  { city: 'Glendale', state: 'AZ', response: '3 hrs', techs: 3 },
  { city: 'Peoria', state: 'AZ', response: '4 hrs', techs: 2 },
  { city: 'Surprise', state: 'AZ', response: '4 hrs', techs: 2 },
  { city: 'Avondale', state: 'AZ', response: '4 hrs', techs: 2 },
  { city: 'Goodyear', state: 'AZ', response: '4 hrs', techs: 1 },
  { city: 'Queen Creek', state: 'AZ', response: '5 hrs', techs: 1 },
];

export const STATS = [
  { value: '14,800+', label: 'Service calls completed' },
  { value: '35', label: 'Licensed staff on the roster' },
  { value: '4.9', label: 'Average rating across 2,100 reviews' },
  { value: '2 hrs', label: 'Median emergency response' },
];

export const PROCESS = [
  {
    step: '01',
    title: 'Tell us what the system is doing',
    body: 'Describe the fault, attach photos, and pick a window that works. Takes about ninety seconds — no account required.',
  },
  {
    step: '02',
    title: 'Get a line-item quotation',
    body: 'Labour and equipment priced separately, tax and any discount shown. Approve or decline it online. Nothing starts until you say so.',
  },
  {
    step: '03',
    title: 'Track the technician in',
    body: 'You see who is coming, their certifications, and when they left the depot. No four-hour window, no mystery van.',
  },
  {
    step: '04',
    title: 'Sign off and keep the record',
    body: 'Before-and-after photos, meter readings and the full service report land in your portal — permanently, not on a carbon copy.',
  },
];

export const WHY_US = [
  {
    title: 'We measure before we quote',
    body: 'Every replacement quote is backed by a load calculation and a static pressure reading. Undersizing is the single most common reason a new system underperforms.',
  },
  {
    title: 'Flat pricing, published up front',
    body: 'Labour rates and equipment pricing appear on the quotation as separate lines. You see exactly what the parts cost and exactly what the work costs.',
  },
  {
    title: 'The same technician, where we can',
    body: 'Plan members are routed to the technician who knows their system. Continuity catches the drift that a stranger reads as normal.',
  },
  {
    title: 'Your records outlive the visit',
    body: 'Every reading, photo and report stays in your portal. When you sell the house or dispute a warranty claim, the history is already documented.',
  },
];

export const FAQS = [
  {
    q: 'How quickly can you get to an emergency?',
    a: 'Our median emergency response across the Phoenix metro is two hours. Elite Total Care members carry a contractual four-hour guarantee, 24/7/365. Everyone else is dispatched to the next available van, prioritised by severity — total failure in extreme heat and any gas or electrical safety concern jump the queue.',
  },
  {
    q: 'Do you charge for a quotation?',
    a: 'Replacement and installation quotes are free, including the load calculation. Repair work carries a $95 diagnostic fee because it involves real measurement time — and that fee is credited in full against the repair if you approve the work.',
  },
  {
    q: 'What does the diagnostic actually cover?',
    a: 'A full electrical check (contactor, capacitor, motor amp draw), refrigerant charge verified against superheat and subcooling, airflow and static pressure measurement, and a condition assessment of the coil, drain and blower assembly. You receive the readings in writing, not just a verdict.',
  },
  {
    q: 'Is a maintenance plan actually worth it?',
    a: 'It depends on your system. If it is under five years old and you are diligent about filters, probably not yet. Past that, two tune-ups a year plus the repair discount usually costs less than a single emergency call-out — and the plan discount applies to that call-out too if you need it.',
  },
  {
    q: 'Can I keep my existing equipment brand?',
    a: 'Yes. We install Carrier, Trane, Lennox, Rheem, Goodman, Daikin and Mitsubishi, and we service every major brand regardless of who installed it. We will tell you honestly when a brand change makes sense and when it is just a badge swap.',
  },
  {
    q: 'How does the online portal work?',
    a: 'Every request, quotation, appointment, service report and invoice lives in your account. You approve quotes, watch the technician get assigned, view before-and-after photos, and settle invoices from the same place. Guests can track a request with just the code we send, no account needed.',
  },
  {
    q: 'Do you handle commercial properties?',
    a: 'Yes — rooftop units, split systems, walk-in refrigeration and multi-tenant buildings. Our Commercial Assurance plan includes six scheduled visits a year, compliance documentation and quarterly performance reporting.',
  },
  {
    q: 'What warranty comes with the work?',
    a: 'Labour is warranted for 90 days on repairs and two years on installations. Parts carry the manufacturer warranty, typically 5–10 years on qualifying equipment when registered — and we file that registration for you.',
  },
];

export const SITE_NAV = [
  { href: '/services', label: 'Services' },
  { href: '/maintenance-plans', label: 'Plans' },
  { href: '/service-areas', label: 'Areas' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];
