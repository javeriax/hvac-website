import { SVGProps } from 'react';

/**
 * Icons, drawn here rather than pulled from a library: 24px box, 1.5 stroke,
 * round caps. Doing them by hand mostly paid off for the HVAC-specific ones
 * (duct, airflow, thermostat) which no icon set has.
 */

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

/* ------------------------------- HVAC domain ------------------------------- */

export const IconSnowflake = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2v20M4.2 6.5l15.6 9M19.8 6.5l-15.6 9" />
    <path d="M9 4.4 12 7l3-2.6M9 19.6 12 17l3 2.6" />
    <path d="m4.6 10.4.2 3.1 2.9 1M19.4 10.4l-.2 3.1-2.9 1" />
    <path d="m7.5 8.5-2.9 1-.2-3.1M16.5 8.5l2.9 1 .2-3.1" />
  </svg>
);

export const IconFlame = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2.7s5.2 4 5.2 9.1a5.2 5.2 0 1 1-10.4 0c0-1.9.8-3.3 1.7-4.4.4 1 1.1 1.8 1.9 2.1.4-2.6.9-4.7 1.6-6.8Z" />
    <path d="M12 20a2.6 2.6 0 0 1-2.6-2.6c0-1.6 2.6-4 2.6-4s2.6 2.4 2.6 4A2.6 2.6 0 0 1 12 20Z" />
  </svg>
);

export const IconThermostat = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    <path d="M12 12V9.6" />
  </svg>
);

export const IconAirflow = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.8 8h11.4a2.6 2.6 0 1 0-2.6-2.6" />
    <path d="M2.8 12h14.6a2.8 2.8 0 1 1-2.8 2.8" />
    <path d="M2.8 16h7.6" />
  </svg>
);

export const IconDuct = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="7" width="19" height="10" rx="2" />
    <path d="M7 7v10M12 7v10M17 7v10" />
  </svg>
);

export const IconGauge = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 17a9 9 0 1 1 17 0" />
    <path d="m12 13 4-3.4" />
    <circle cx="12" cy="13.6" r="1.4" />
  </svg>
);

export const IconWrench = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14.9 6.2a3.9 3.9 0 0 0 5 5L15 16l-4 4.2a2.3 2.3 0 0 1-3.3-3.2L12 12.7 6.9 7.6l-1.6.4-2.4-3.6L4.8 2.5 8.4 5l-.4 1.6 5.1 5.1Z" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2.6 4.8 5.4v5.9c0 4.4 2.9 8.3 7.2 9.7 4.3-1.4 7.2-5.3 7.2-9.7V5.4Z" />
    <path d="m8.8 12 2.3 2.3 4.1-4.4" />
  </svg>
);

/* ------------------------------- UI + system ------------------------------- */

export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 12h15m-5.5-5.5L19 12l-5.5 5.5" /></svg>
);
export const IconArrowLeft = (p: IconProps) => (
  <svg {...base(p)}><path d="M20 12H5m5.5-5.5L5 12l5.5 5.5" /></svg>
);
export const IconArrowUpRight = (p: IconProps) => (
  <svg {...base(p)}><path d="M7 17 17 7M8.5 7H17v8.5" /></svg>
);
export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)}><path d="m6 9.5 6 6 6-6" /></svg>
);
export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}><path d="m9.5 6 6 6-6 6" /></svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}><path d="m4.5 12.5 5 5 10-11" /></svg>
);
export const IconX = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconMinus = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12h14" /></svg>
);
export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
);
export const IconBell = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z" />
    <path d="M13.7 19a2 2 0 0 1-3.4 0" />
  </svg>
);
export const IconUser = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="3.6" /><path d="M4.6 20a7.6 7.6 0 0 1 14.8 0" /></svg>
);
export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9.5" cy="8" r="3.3" />
    <path d="M2.8 19.5a6.8 6.8 0 0 1 13.4 0" />
    <path d="M16.5 5.2a3.3 3.3 0 0 1 0 6.4M17.6 14.4a6.6 6.6 0 0 1 3.6 5.1" />
  </svg>
);
export const IconCalendar = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.2" />
    <path d="M3.5 9.6h17M8 3v4M16 3v4" />
  </svg>
);
export const IconClock = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5.3l3.4 2" /></svg>
);
export const IconMapPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21.5s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10.4" r="2.6" />
  </svg>
);
export const IconPhone = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6.2 3.5h3l1.5 3.8-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 3.8 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
  </svg>
);
export const IconMail = (p: IconProps) => (
  <svg {...base(p)}><rect x="2.5" y="5" width="19" height="14" rx="2.4" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>
);
export const IconDoc = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M13.5 2.8H7a2 2 0 0 0-2 2v14.4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.3Z" />
    <path d="M13.5 2.8v5.5H19M8.5 13h7M8.5 16.5h4.5" />
  </svg>
);
export const IconReceipt = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 2.8v18.4l2.3-1.5 2.4 1.5 2.3-1.5 2.4 1.5 2.3-1.5 2 1.5V2.8Z" />
    <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
  </svg>
);
export const IconChart = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 20h16M7.5 20v-6M12 20V6.5M16.5 20v-9" /></svg>
);
export const IconTrendUp = (p: IconProps) => (
  <svg {...base(p)}><path d="m3.5 15.5 5-5 3.5 3.5 6-6.5" /><path d="M14.5 7.5h4v4" /></svg>
);
export const IconTrendDown = (p: IconProps) => (
  <svg {...base(p)}><path d="m3.5 8.5 5 5 3.5-3.5 6 6.5" /><path d="M14.5 16.5h4v-4" /></svg>
);
export const IconSettings = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3.1" />
    <path d="M12 2.6v2.2M12 19.2v2.2M4.4 12H2.2M21.8 12h-2.2M6.6 6.6 5 5M19 19l-1.6-1.6M17.4 6.6 19 5M5 19l1.6-1.6" />
  </svg>
);
export const IconLogout = (p: IconProps) => (
  <svg {...base(p)}><path d="M15 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H15" /><path d="M10 8.5 6.5 12l3.5 3.5M6.5 12H15" /></svg>
);
export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconCamera = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 8.5h3l1.6-2.4h8.8L18 8.5h3v10.4a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 18.9Z" />
    <circle cx="12" cy="13.6" r="3.4" />
  </svg>
);
export const IconUpload = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 16V4.5m-4 4 4-4 4 4" /><path d="M4 16v2.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V16" /></svg>
);
export const IconSignature = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 16.5c2.6 0 3-8.5 5.2-8.5 1.6 0 1 6.4 2.7 6.4 1.4 0 1.6-4.4 3.1-4.4 1.3 0 1.2 3.4 2.6 3.4.9 0 1.4-1.2 2.4-1.2" />
    <path d="M3 20.5h18" />
  </svg>
);
export const IconStar = (p: IconProps) => (
  <svg {...base(p)}><path d="m12 3.5 2.7 5.6 6.1.9-4.4 4.3 1 6.2-5.4-2.9-5.4 2.9 1-6.2L3.2 10l6.1-.9Z" /></svg>
);
export const IconAlert = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3.5 21 19.5H3Z" /><path d="M12 9.5v4.2M12 16.8v.1" /></svg>
);
export const IconInfo = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.8v.1" /></svg>
);
export const IconSun = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.6v2M12 19.4v2M4.4 12h-2M21.6 12h-2M6.5 6.5 5.1 5.1M18.9 18.9l-1.4-1.4M17.5 6.5l1.4-1.4M5.1 18.9l1.4-1.4" />
  </svg>
);
export const IconMoon = (p: IconProps) => (
  <svg {...base(p)}><path d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.6 8.6 0 1 0 10.2 10.2Z" /></svg>
);
export const IconTruck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.5 16.5V6.4h11v10.1M13.5 9.4h3.9l3.1 3.3v3.8" />
    <circle cx="7" cy="17.6" r="1.9" /><circle cx="17" cy="17.6" r="1.9" />
  </svg>
);
export const IconPlay = (p: IconProps) => (
  <svg {...base(p)}><path d="M7.5 5.2 18.5 12l-11 6.8Z" /></svg>
);
export const IconRefresh = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 11.5A8 8 0 0 0 6.2 6.4L4 8.5" /><path d="M4 4.5v4h4" />
    <path d="M4 12.5a8 8 0 0 0 13.8 5.1L20 15.5" /><path d="M20 19.5v-4h-4" />
  </svg>
);
export const IconFilter = (p: IconProps) => (
  <svg {...base(p)}><path d="M3.5 5.5h17l-6.6 7.6v5.6l-3.8 1.8v-7.4Z" /></svg>
);
export const IconPrint = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 8.5V3.5h10v5M7 18.5H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <rect x="7" y="14.5" width="10" height="6" rx="1" />
  </svg>
);
export const IconCard = (p: IconProps) => (
  <svg {...base(p)}><rect x="2.5" y="5" width="19" height="14" rx="2.4" /><path d="M2.5 9.6h19M6.5 15h3" /></svg>
);
export const IconClipboard = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 4.5H7a2 2 0 0 0-2 2v12.4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6.5a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="2.6" width="6" height="3.8" rx="1.2" />
    <path d="M8.8 12h6.4M8.8 15.6h4" />
  </svg>
);
export const IconGrid = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </svg>
);
export const IconSpark = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.2 13.6 9l5.8 1.6-5.8 1.6L12 18l-1.6-5.8L4.6 10.6 10.4 9Z" />
    <path d="M18.6 3.4 19.3 5.6l2.2.7-2.2.7-.7 2.2-.7-2.2-2.2-.7 2.2-.7Z" />
  </svg>
);
export const IconSend = (p: IconProps) => (
  <svg {...base(p)}><path d="M21 3 10.5 13.5M21 3l-6.6 18-3.9-7.5L3 9.6Z" /></svg>
);
export const IconExternal = (p: IconProps) => (
  <svg {...base(p)}><path d="M13.5 4.5H19.5v6M19.5 4.5 11 13" /><path d="M18 14.5v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h4" /></svg>
);

/** Maps a service type to its glyph, used across cards, tables and dashboards. */
export const SERVICE_ICONS: Record<string, (p: IconProps) => JSX.Element> = {
  installation: IconDuct,
  repair: IconWrench,
  maintenance: IconShield,
  inspection: IconGauge,
  'duct-cleaning': IconAirflow,
  thermostat: IconThermostat,
  emergency: IconFlame,
};
