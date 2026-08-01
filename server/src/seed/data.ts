/** Static reference data used by the seeder. Kept apart so it reads like a catalogue. */

export const SERVICE_AREAS = [
  { city: 'Phoenix', state: 'AZ', zip: '85004', techs: 4 },
  { city: 'Scottsdale', state: 'AZ', zip: '85251', techs: 3 },
  { city: 'Mesa', state: 'AZ', zip: '85201', techs: 3 },
  { city: 'Tempe', state: 'AZ', zip: '85281', techs: 2 },
  { city: 'Chandler', state: 'AZ', zip: '85224', techs: 2 },
  { city: 'Glendale', state: 'AZ', zip: '85301', techs: 2 },
  { city: 'Gilbert', state: 'AZ', zip: '85233', techs: 2 },
  { city: 'Peoria', state: 'AZ', zip: '85345', techs: 1 },
];

export const STREETS = [
  'W Camelback Rd', 'E Indian School Rd', 'N Scottsdale Rd', 'S Rural Rd',
  'E Baseline Rd', 'W Bell Rd', 'N 7th St', 'E Chandler Blvd',
  'W Thunderbird Rd', 'S Dobson Rd', 'E McDowell Rd', 'N 51st Ave',
];

export const PLANS = [
  {
    slug: 'essential',
    name: 'Essential Care',
    tagline: 'Seasonal peace of mind for a single system.',
    priceMonthly: 19,
    priceAnnual: 199,
    visitsPerYear: 2,
    responseHours: 48,
    repairDiscountPercent: 10,
    sortOrder: 1,
    features: [
      '2 precision tune-ups per year',
      '21-point system inspection',
      '10% off all repairs',
      'Filter replacement included',
      'Priority booking over non-members',
      'No overtime charges on weekdays',
    ],
  },
  {
    slug: 'comfort',
    name: 'Comfort Plus',
    tagline: 'Our most popular plan — faster response, deeper coverage.',
    priceMonthly: 34,
    priceAnnual: 359,
    visitsPerYear: 3,
    responseHours: 24,
    repairDiscountPercent: 15,
    isPopular: true,
    sortOrder: 2,
    features: [
      '3 precision tune-ups per year',
      '21-point inspection + duct assessment',
      '15% off all repairs',
      '24-hour guaranteed response',
      'Waived diagnostic fee',
      'Free thermostat calibration',
      'Refrigerant top-up up to 2 lbs',
    ],
  },
  {
    slug: 'elite',
    name: 'Elite Total Care',
    tagline: 'Whole-home coverage with same-day emergency priority.',
    priceMonthly: 59,
    priceAnnual: 629,
    visitsPerYear: 4,
    responseHours: 4,
    repairDiscountPercent: 25,
    sortOrder: 3,
    features: [
      '4 precision tune-ups per year',
      'Covers up to 3 systems',
      '25% off all repairs',
      '4-hour emergency response, 24/7',
      'Annual duct cleaning included',
      'Free filters shipped quarterly',
      'Extended labour warranty (2 years)',
      'Dedicated account manager',
    ],
  },
  {
    slug: 'commercial',
    name: 'Commercial Assurance',
    tagline: 'Built for multi-unit and light-industrial sites.',
    priceMonthly: 149,
    priceAnnual: 1599,
    visitsPerYear: 6,
    responseHours: 4,
    repairDiscountPercent: 20,
    sortOrder: 4,
    features: [
      '6 scheduled service visits per year',
      'Rooftop unit and RTU coverage',
      '20% off all repairs and parts',
      '4-hour response, 24/7/365',
      'Compliance documentation pack',
      'Quarterly performance reporting',
      'Dedicated commercial technician team',
    ],
  },
];

export const EQUIPMENT = [
  { sku: 'AC-CAR-16S', name: 'Carrier Infinity 16 SEER Condenser (3 Ton)', category: 'ac-unit', brand: 'Carrier', modelNumber: '24ANB6', unitPrice: 3450, stock: 12, specs: [{ label: 'SEER', value: '16' }, { label: 'Capacity', value: '3 Ton' }] },
  { sku: 'AC-TRN-18S', name: 'Trane XV18 Variable Speed Condenser (4 Ton)', category: 'ac-unit', brand: 'Trane', modelNumber: '4TTV8', unitPrice: 4880, stock: 7, specs: [{ label: 'SEER', value: '18' }, { label: 'Capacity', value: '4 Ton' }] },
  { sku: 'AC-GDM-14S', name: 'Goodman GSX14 Condenser (2.5 Ton)', category: 'ac-unit', brand: 'Goodman', modelNumber: 'GSX140301', unitPrice: 1980, stock: 15, specs: [{ label: 'SEER', value: '14' }, { label: 'Capacity', value: '2.5 Ton' }] },
  { sku: 'FR-LEN-96G', name: 'Lennox EL296V Gas Furnace 96% AFUE', category: 'furnace', brand: 'Lennox', modelNumber: 'EL296V', unitPrice: 2790, stock: 9, specs: [{ label: 'AFUE', value: '96%' }, { label: 'Stages', value: '2' }] },
  { sku: 'FR-RHM-80G', name: 'Rheem Classic 80% AFUE Furnace', category: 'furnace', brand: 'Rheem', modelNumber: 'R802V', unitPrice: 1650, stock: 11, specs: [{ label: 'AFUE', value: '80%' }] },
  { sku: 'HP-MIT-HYP', name: 'Mitsubishi Hyper-Heat Mini Split (18k BTU)', category: 'heat-pump', brand: 'Mitsubishi', modelNumber: 'MSZ-FS18NA', unitPrice: 3260, stock: 6, specs: [{ label: 'BTU', value: '18,000' }, { label: 'HSPF', value: '11.5' }] },
  { sku: 'HP-DKN-24K', name: 'Daikin Aurora Heat Pump (24k BTU)', category: 'heat-pump', brand: 'Daikin', modelNumber: 'RXL24', unitPrice: 3890, stock: 5, specs: [{ label: 'BTU', value: '24,000' }] },
  { sku: 'TH-ECO-PRM', name: 'Ecobee Smart Thermostat Premium', category: 'thermostat', brand: 'Ecobee', modelNumber: 'EB-STATE6', unitPrice: 249, stock: 34, specs: [{ label: 'Sensors', value: 'Included' }] },
  { sku: 'TH-NST-LRN', name: 'Google Nest Learning Thermostat (4th Gen)', category: 'thermostat', brand: 'Google', modelNumber: 'GA02082', unitPrice: 279, stock: 28 },
  { sku: 'TH-HON-T6', name: 'Honeywell T6 Pro Programmable', category: 'thermostat', brand: 'Honeywell', modelNumber: 'TH6220WF', unitPrice: 129, stock: 41 },
  { sku: 'AH-CAR-FE4', name: 'Carrier FE4 Fan Coil Air Handler', category: 'air-handler', brand: 'Carrier', modelNumber: 'FE4ANF', unitPrice: 1580, stock: 8 },
  { sku: 'DC-FLX-R8', name: 'R-8 Insulated Flex Duct (25 ft run)', category: 'ductwork', brand: 'Atco', unitPrice: 96, unit: 'run', stock: 60 },
  { sku: 'FL-MRV-16', name: 'MERV 16 Media Filter 20x25x5', category: 'filter', brand: 'Aprilaire', modelNumber: '213', unitPrice: 74, stock: 120, reorderLevel: 30 },
  { sku: 'FL-MRV-11', name: 'MERV 11 Pleated Filter 16x25x1 (6 pack)', category: 'filter', brand: 'Filtrete', unitPrice: 38, stock: 95, reorderLevel: 25 },
  { sku: 'PT-CAP-45', name: 'Dual Run Capacitor 45/5 MFD 440V', category: 'part', brand: 'TitanPro', unitPrice: 42, stock: 65 },
  { sku: 'PT-CNT-2P', name: 'Contactor 2-Pole 30A 24V', category: 'part', brand: 'Packard', unitPrice: 38, stock: 48 },
  { sku: 'PT-MTR-BLW', name: 'ECM Blower Motor 1/2 HP', category: 'part', brand: 'Genteq', unitPrice: 385, stock: 14 },
  { sku: 'PT-R410-25', name: 'R-410A Refrigerant (25 lb cylinder)', category: 'part', brand: 'Chemours', unitPrice: 215, unit: 'cylinder', stock: 22 },
  { sku: 'PT-TXV-3T', name: 'Thermal Expansion Valve (3 Ton)', category: 'part', brand: 'Emerson', unitPrice: 118, stock: 19 },
  { sku: 'PT-IGN-HSI', name: 'Hot Surface Igniter (Universal)', category: 'part', brand: 'White-Rodgers', unitPrice: 56, stock: 37 },
];

export const TECHNICIANS = [
  { name: 'Marcus Delgado', email: 'marcus@arcticair.com', skills: ['Installation', 'Refrigeration', 'Commercial RTU'], certifications: ['NATE Certified', 'EPA 608 Universal'], areas: ['Phoenix', 'Glendale'], rate: 96, rating: 4.9 },
  { name: 'Priya Raghunathan', email: 'priya@arcticair.com', skills: ['Diagnostics', 'Heat Pumps', 'Smart Controls'], certifications: ['NATE Certified', 'EPA 608 Type II'], areas: ['Scottsdale', 'Tempe'], rate: 92, rating: 4.8 },
  { name: 'Dmitri Volkov', email: 'dmitri@arcticair.com', skills: ['Ductwork', 'Air Quality', 'Installation'], certifications: ['EPA 608 Universal', 'OSHA 30'], areas: ['Mesa', 'Gilbert'], rate: 88, rating: 4.7 },
  { name: 'Aaliyah Brooks', email: 'aaliyah@arcticair.com', skills: ['Emergency Repair', 'Furnaces', 'Diagnostics'], certifications: ['NATE Certified', 'EPA 608 Type I'], areas: ['Phoenix', 'Chandler'], rate: 94, rating: 5.0 },
  { name: 'Tomas Herrera', email: 'tomas@arcticair.com', skills: ['Maintenance', 'Thermostats', 'Duct Cleaning'], certifications: ['EPA 608 Type II'], areas: ['Chandler', 'Gilbert', 'Mesa'], rate: 82, rating: 4.6 },
  { name: 'Grace Okonkwo', email: 'grace@arcticair.com', skills: ['Commercial RTU', 'Controls', 'Installation'], certifications: ['NATE Certified', 'EPA 608 Universal', 'OSHA 30'], areas: ['Phoenix', 'Tempe', 'Peoria'], rate: 98, rating: 4.9 },
];

export const CUSTOMERS = [
  { name: 'Elena Marchetti', email: 'elena.m@example.com', type: 'residential' },
  { name: 'Robert Chen', email: 'r.chen@example.com', type: 'residential' },
  { name: 'Desert Ridge Dental', email: 'ops@desertridgedental.com', type: 'commercial', company: 'Desert Ridge Dental Group' },
  { name: 'Amara Nwosu', email: 'amara.n@example.com', type: 'residential' },
  { name: 'James Whitfield', email: 'j.whitfield@example.com', type: 'residential' },
  { name: 'Sunbelt Logistics', email: 'facilities@sunbeltlog.com', type: 'commercial', company: 'Sunbelt Logistics Inc.' },
  { name: 'Fatima Al-Rashid', email: 'fatima.ar@example.com', type: 'residential' },
  { name: 'Nathan Osei', email: 'n.osei@example.com', type: 'residential' },
  { name: 'Copperleaf Apartments', email: 'manager@copperleafapts.com', type: 'commercial', company: 'Copperleaf Property Management' },
  { name: 'Sofia Delacroix', email: 'sofia.d@example.com', type: 'residential' },
  { name: 'Marcus Wynn', email: 'm.wynn@example.com', type: 'residential' },
  { name: 'Hana Takahashi', email: 'hana.t@example.com', type: 'residential' },
  { name: 'Cactus Bloom Bakery', email: 'hello@cactusbloom.com', type: 'commercial', company: 'Cactus Bloom Bakery LLC' },
  { name: 'Owen Castellanos', email: 'owen.c@example.com', type: 'residential' },
  { name: 'Ingrid Solberg', email: 'ingrid.s@example.com', type: 'residential' },
  { name: 'Terrence Boyd', email: 't.boyd@example.com', type: 'residential' },
  { name: 'Valley Vista Clinic', email: 'admin@valleyvistaclinic.com', type: 'commercial', company: 'Valley Vista Medical' },
  { name: 'Yuki Nakamura', email: 'yuki.n@example.com', type: 'residential' },
  { name: 'Priscilla Adeyemi', email: 'p.adeyemi@example.com', type: 'residential' },
  { name: 'Caleb Rowan', email: 'c.rowan@example.com', type: 'residential' },
  { name: 'Mirabel Vasquez', email: 'mirabel.v@example.com', type: 'residential' },
  { name: 'Silas Thornton', email: 's.thornton@example.com', type: 'residential' },
  { name: 'Northgate Fitness', email: 'ops@northgatefit.com', type: 'commercial', company: 'Northgate Fitness Co.' },
  { name: 'Leila Haddad', email: 'leila.h@example.com', type: 'residential' },
];

export const REQUEST_TEMPLATES: Record<
  string,
  { title: string; description: string; labor: [string, number, number]; parts: [string, number, number][] }[]
> = {
  repair: [
    {
      title: 'AC blowing warm air upstairs',
      description:
        'The upstairs unit runs constantly but only pushes warm air. Downstairs is fine. Started two days ago during the heatwave.',
      labor: ['Diagnostic and refrigerant service — 2.5h', 2.5, 95],
      parts: [['Dual Run Capacitor 45/5 MFD 440V', 1, 42], ['R-410A Refrigerant (per lb)', 3, 38]],
    },
    {
      title: 'Outdoor unit making grinding noise',
      description:
        'Loud metallic grinding from the condenser whenever the system kicks on. Unit is about 8 years old and has never been serviced.',
      labor: ['Condenser fan motor replacement — 3h', 3, 95],
      parts: [['ECM Blower Motor 1/2 HP', 1, 385]],
    },
    {
      title: 'System short cycling every few minutes',
      description:
        'Thermostat reads correctly but the compressor kicks on and off every 3-4 minutes. Energy bill has doubled this month.',
      labor: ['Diagnostics and TXV replacement — 4h', 4, 95],
      parts: [['Thermal Expansion Valve (3 Ton)', 1, 118], ['R-410A Refrigerant (per lb)', 4, 38]],
    },
    {
      title: 'Furnace not igniting',
      description:
        'Furnace clicks but never lights. We can smell a faint gas odour near the unit for a second before it shuts off.',
      labor: ['Emergency furnace diagnostic and igniter swap — 2h', 2, 135],
      parts: [['Hot Surface Igniter (Universal)', 1, 56]],
    },
    {
      title: 'Water pooling around indoor unit',
      description:
        'Found standing water on the closet floor beneath the air handler this morning. Drywall is starting to stain.',
      labor: ['Condensate line clearing and pan service — 1.5h', 1.5, 95],
      parts: [],
    },
  ],
  installation: [
    {
      title: 'Replace 14-year-old AC system',
      description:
        'Existing 3-ton unit is failing repeatedly and the compressor is original. Looking for a high-efficiency replacement with a rebate.',
      labor: ['Full system changeout — 8h crew of two', 8, 105],
      parts: [['Carrier Infinity 16 SEER Condenser (3 Ton)', 1, 3450], ['Carrier FE4 Fan Coil Air Handler', 1, 1580]],
    },
    {
      title: 'New mini split for converted garage',
      description:
        'Garage converted to a home office. Needs its own zone — roughly 400 sq ft, west-facing with heavy afternoon sun.',
      labor: ['Mini split installation and line set — 6h', 6, 105],
      parts: [['Mitsubishi Hyper-Heat Mini Split (18k BTU)', 1, 3260]],
    },
    {
      title: 'Rooftop unit replacement — retail suite',
      description:
        'One of three RTUs has failed. Needs replacement with minimal downtime; the suite operates 7 days a week.',
      labor: ['Commercial RTU changeout with crane — 10h', 10, 125],
      parts: [['Trane XV18 Variable Speed Condenser (4 Ton)', 1, 4880]],
    },
    {
      title: 'Heat pump upgrade for whole home',
      description:
        'Moving off gas heat. Want a variable-speed heat pump sized for a 2,100 sq ft single storey.',
      labor: ['Heat pump installation and commissioning — 9h', 9, 105],
      parts: [['Daikin Aurora Heat Pump (24k BTU)', 1, 3890]],
    },
  ],
  maintenance: [
    {
      title: 'Annual pre-summer tune-up',
      description: 'Standard seasonal service before temperatures climb. Two systems on the property.',
      labor: ['Precision tune-up — 1.5h', 1.5, 85],
      parts: [['MERV 11 Pleated Filter 16x25x1 (6 pack)', 1, 38]],
    },
    {
      title: 'Fall heating system check',
      description: 'Furnace has not run since March. Would like it checked before the first cold night.',
      labor: ['Heating system inspection — 1.5h', 1.5, 85],
      parts: [],
    },
    {
      title: 'Quarterly commercial service visit',
      description: 'Scheduled quarterly visit across all rooftop units per the maintenance agreement.',
      labor: ['Commercial multi-unit service — 5h', 5, 110],
      parts: [['MERV 16 Media Filter 20x25x5', 4, 74]],
    },
  ],
  inspection: [
    {
      title: 'Pre-purchase HVAC inspection',
      description:
        'Under contract on a 1998 build. Need a written condition report on the HVAC system for the inspection period.',
      labor: ['Full system inspection and written report — 2h', 2, 90],
      parts: [],
    },
    {
      title: 'Airflow imbalance assessment',
      description:
        'Two bedrooms never cool properly while the living room is freezing. Suspect a duct sizing or damper issue.',
      labor: ['Static pressure and airflow assessment — 3h', 3, 90],
      parts: [],
    },
  ],
  'duct-cleaning': [
    {
      title: 'Whole-home duct cleaning',
      description:
        'Heavy dust on the registers and allergy symptoms since we moved in. Ducts have likely never been cleaned.',
      labor: ['Full duct system cleaning and sanitising — 5h', 5, 88],
      parts: [['R-8 Insulated Flex Duct (25 ft run)', 2, 96]],
    },
  ],
  thermostat: [
    {
      title: 'Smart thermostat installation',
      description: 'Want to replace two old dial thermostats with smart units we can control while travelling.',
      labor: ['Smart thermostat install and configuration — 1.5h', 1.5, 85],
      parts: [['Ecobee Smart Thermostat Premium', 2, 249]],
    },
    {
      title: 'Thermostat reading wrong temperature',
      description: 'Thermostat shows 74 but a separate thermometer next to it reads 79. System never satisfies.',
      labor: ['Thermostat diagnostics and replacement — 1h', 1, 85],
      parts: [['Honeywell T6 Pro Programmable', 1, 129]],
    },
  ],
  emergency: [
    {
      title: 'No cooling — 112°F outside, elderly resident',
      description:
        'System completely dead. My mother is 84 and the house is already at 89 degrees. Need someone today.',
      labor: ['After-hours emergency call-out — 3h', 3, 165],
      parts: [['Contactor 2-Pole 30A 24V', 1, 38], ['Dual Run Capacitor 45/5 MFD 440V', 1, 42]],
    },
    {
      title: 'Burning smell from vents — system shut off',
      description:
        'Strong burning smell through the whole house. We killed the breaker. Need an emergency safety inspection.',
      labor: ['Emergency safety inspection and motor replacement — 4h', 4, 165],
      parts: [['ECM Blower Motor 1/2 HP', 1, 385]],
    },
    {
      title: 'Walk-in cooler down — commercial kitchen',
      description:
        'Walk-in is at 51°F and climbing. We have several thousand dollars of stock at risk. Need immediate response.',
      labor: ['Emergency commercial refrigeration call — 5h', 5, 185],
      parts: [['R-410A Refrigerant (per lb)', 6, 38], ['Thermal Expansion Valve (3 Ton)', 1, 118]],
    },
  ],
};

export const TESTIMONIALS = [
  { author: 'Elena Marchetti', role: 'Homeowner', city: 'Scottsdale', rating: 5, serviceType: 'repair', quote: 'Our AC died at 4pm on a Friday in July. ArcticAir had Aaliyah at the door by 6:30 and cold air by 8. I have never seen a service company move that fast.' },
  { author: 'Daniel Reyes', role: 'Facilities Manager', city: 'Phoenix', rating: 5, serviceType: 'installation', quote: 'We run three rooftop units across two retail suites. The quarterly reports ArcticAir send us are more detailed than what our previous vendor produced in five years.' },
  { author: 'Hana Takahashi', role: 'Homeowner', city: 'Tempe', rating: 5, serviceType: 'maintenance', quote: 'The portal is the part that surprised me. I can see exactly which technician is coming, when they left the depot, and the full report with photos afterwards.' },
  { author: 'Marcus Wynn', role: 'Homeowner', city: 'Mesa', rating: 5, serviceType: 'installation', quote: 'Got three quotes for a full system replacement. ArcticAir was not the cheapest, but they were the only ones who measured the ductwork before pricing it. Worth every dollar.' },
  { author: 'Priya Kaur', role: 'Property Manager', city: 'Chandler', rating: 5, serviceType: 'maintenance', quote: 'Managing 42 units used to mean 42 phone calls. Now everything routes through one dashboard and I approve quotes from my phone.' },
  { author: 'Terrence Boyd', role: 'Homeowner', city: 'Gilbert', rating: 4, serviceType: 'duct-cleaning', quote: 'Duct cleaning made an immediate difference to the dust in the house. Tomas walked me through before-and-after photos of every run.' },
  { author: 'Ingrid Solberg', role: 'Homeowner', city: 'Glendale', rating: 5, serviceType: 'thermostat', quote: 'Small job — two thermostats — but they treated it like a big one. Set up the app, showed me the scheduling, and did not leave until I understood it.' },
  { author: 'Owen Castellanos', role: 'Restaurant Owner', city: 'Phoenix', rating: 5, serviceType: 'emergency', quote: 'Walk-in cooler failed on a Saturday night with a full kitchen. They saved roughly four thousand dollars of stock. I do not use anyone else now.' },
  { author: 'Fatima Al-Rashid', role: 'Homeowner', city: 'Peoria', rating: 5, serviceType: 'maintenance', quote: 'Third year on the Comfort Plus plan. Two tune-ups a year, no surprise bills, and the same technician every time so he knows the system.' },
  { author: 'Silas Thornton', role: 'Homeowner', city: 'Scottsdale', rating: 4, serviceType: 'inspection', quote: 'Bought a 1998 house and needed an honest assessment. They told me the furnace had four good years left rather than trying to sell me a new one.' },
];

export const FIRST_NAMES_NOTE =
  'All demo accounts share the password ArcticAir#2026 — see README for the credential table.';
