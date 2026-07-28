// Static marketing content for the corporate site (Module 1).
// Kept in one place so Home, Services, etc. stay in sync.

export type Service = {
  slug: string;
  name: string;
  summary: string;
  details: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "installation",
    name: "HVAC Installation",
    summary: "New system sizing and installation for homes and commercial spaces.",
    details: [
      "Load calculation and equipment sizing",
      "Central air, heat pump, and ductless mini-split installation",
      "Ductwork design and installation",
      "Manufacturer warranty registration",
    ],
  },
  {
    slug: "repair",
    name: "Repair Services",
    summary: "Diagnosis and repair for heating and cooling systems of any brand.",
    details: [
      "Same-week and emergency repair appointments",
      "Refrigerant leak detection and recharge",
      "Electrical and control board diagnostics",
      "Compressor, motor, and capacitor replacement",
    ],
  },
  {
    slug: "emergency",
    name: "Emergency Service",
    summary: "24/7 response for no-heat, no-cool, and system failure calls.",
    details: [
      "24/7 phone line for active emergencies",
      "Priority dispatch ahead of standard scheduling",
      "On-site diagnostics within the same visit",
    ],
  },
  {
    slug: "maintenance",
    name: "Preventive Maintenance",
    summary: "Seasonal tune-ups that catch problems before they cause a breakdown.",
    details: [
      "Coil cleaning and refrigerant level check",
      "Filter replacement and airflow testing",
      "Electrical connection and safety inspection",
      "Thermostat calibration",
    ],
  },
  {
    slug: "duct-cleaning",
    name: "Duct Cleaning",
    summary: "Full duct cleaning to improve air quality and system efficiency.",
    details: [
      "Supply and return duct cleaning",
      "Vent and register cleaning",
      "Optional sanitization treatment",
    ],
  },
  {
    slug: "thermostat",
    name: "Thermostat Installation",
    summary: "Smart and programmable thermostat installation and setup.",
    details: [
      "Smart thermostat installation and Wi-Fi setup",
      "Zoning system configuration",
      "Compatibility check with existing systems",
    ],
  },
];

export type MaintenancePlan = {
  name: string;
  tagline: string;
  price: string;
  visitsPerYear: number;
  features: string[];
  highlighted?: boolean;
};

export const MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    name: "Essential",
    tagline: "Annual check-up for a single system",
    price: "$149/yr",
    visitsPerYear: 1,
    features: [
      "1 seasonal tune-up visit",
      "Filter inspection",
      "Priority scheduling",
      "10% off repair labor",
    ],
  },
  {
    name: "Complete",
    tagline: "Two visits a year, our most requested plan",
    price: "$249/yr",
    visitsPerYear: 2,
    highlighted: true,
    features: [
      "2 seasonal tune-up visits (spring + fall)",
      "Filter replacement included",
      "Priority + same-week scheduling",
      "15% off repair labor",
      "No overtime charges on emergency calls",
    ],
  },
  {
    name: "Commercial",
    tagline: "Multi-unit coverage for commercial properties",
    price: "Custom quote",
    visitsPerYear: 4,
    features: [
      "Quarterly maintenance visits",
      "Coverage for multiple rooftop/split units",
      "Dedicated account technician",
      "20% off repair labor",
      "Compliance-ready service reports",
    ],
  },
];

export type Testimonial = {
  name: string;
  location: string;
  quote: string;
  rating: number;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Karen Whitfield",
    location: "Residential customer",
    quote:
      "Our AC went out on the hottest day of the year and a technician was at the house in under two hours. Fixed on the first visit.",
    rating: 5,
  },
  {
    name: "Marcus Ellery",
    location: "Property manager, downtown office complex",
    quote:
      "We put all six of our buildings on the Commercial maintenance plan. Fewer breakdowns, and the reports make compliance easy.",
    rating: 5,
  },
  {
    name: "Priya Nandakumar",
    location: "Residential customer",
    quote:
      "Quote was clear and itemized, no surprise costs at the end. The technician explained everything before starting the work.",
    rating: 5,
  },
];

export type ServiceArea = {
  city: string;
  state: string;
  responseTime: string;
};

export const SERVICE_AREAS: ServiceArea[] = [
  { city: "Springfield", state: "IL", responseTime: "Same day" },
  { city: "Rockford", state: "IL", responseTime: "Same day" },
  { city: "Peoria", state: "IL", responseTime: "Next day" },
  { city: "Bloomington", state: "IL", responseTime: "Same day" },
  { city: "Decatur", state: "IL", responseTime: "Next day" },
  { city: "Champaign", state: "IL", responseTime: "Same day" },
];

export const FAQS: { question: string; answer: string }[] = [
  {
    question: "How quickly can a technician reach me for an emergency?",
    answer:
      "Emergency calls are prioritized ahead of standard scheduling. Most customers within our core service areas see a technician the same day.",
  },
  {
    question: "Do you provide free quotes?",
    answer:
      "Yes. Submit a request through the Request a Quote page with a description and, if helpful, photos of the issue or installation site. We'll follow up with an itemized quote.",
  },
  {
    question: "What brands of equipment do you service?",
    answer:
      "Our technicians are trained on all major residential and commercial HVAC brands, regardless of who installed the original system.",
  },
  {
    question: "How do maintenance contracts work?",
    answer:
      "Maintenance plans are billed annually and include scheduled visits, filter service, and discounted repair labor. We send renewal reminders before your contract expires.",
  },
  {
    question: "Can I track the status of my service request?",
    answer:
      "Yes. After submitting a request you'll receive a tracking code by email, which you can use on the Track Request page at any time.",
  },
];
