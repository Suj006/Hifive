import type { SVGProps } from "react";

function base(props: SVGProps<SVGSVGElement>) {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export const IconDashboard = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="8" height="9" rx="2" />
    <rect x="13" y="3" width="8" height="5" rx="2" />
    <rect x="13" y="12" width="8" height="9" rx="2" />
    <rect x="3" y="16" width="8" height="5" rx="2" />
  </svg>
);

export const IconBox = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

export const IconTruck = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="1" y="6" width="13" height="11" rx="1.5" />
    <path d="M14 10h4l3 3.5V17h-7z" />
    <circle cx="5.5" cy="18.5" r="1.8" />
    <circle cx="16.5" cy="18.5" r="1.8" />
  </svg>
);

export const IconUsers = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20c0-3.6 2.9-6.2 6.5-6.2S15.5 16.4 15.5 20" />
    <circle cx="17" cy="7" r="2.6" />
    <path d="M16 13.3c2.8.4 4.9 2.7 5 6.7" />
  </svg>
);

export const IconCartDown = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6" />
    <path d="M14 6v6M11 9h6" />
  </svg>
);

export const IconTag = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M2.5 12.5 12 3h6a2.5 2.5 0 0 1 2.5 2.5v6L11 21.5a1.5 1.5 0 0 1-2.1 0l-6.4-6.4a1.5 1.5 0 0 1 0-2.1Z" />
    <circle cx="16" cy="8" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPlus = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconEdit = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const IconTrash = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M3 6h18" />
    <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
    <path d="M19 6l-1 14.5A1.5 1.5 0 0 1 16.5 22h-9A1.5 1.5 0 0 1 6 20.5L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const IconSearch = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const IconRupee = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M6 4h12M6 9h12M6 4c4 0 7 1.6 7 4.5S10 13 6 13l8 8" />
  </svg>
);

export const IconTrendUp = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 6h6v6" />
  </svg>
);

export const IconTrendDown = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M3 7l6 6 4-4 8 8" />
    <path d="M15 18h6v-6" />
  </svg>
);

export const IconWallet = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5Z" />
    <path d="M16 12.5h3" />
    <path d="M3 9h18" />
  </svg>
);

export const IconLayers = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M12 2 2 7l10 5 10-5-10-5Z" />
    <path d="M2 12l10 5 10-5" />
    <path d="M2 17l10 5 10-5" />
  </svg>
);

export const IconAlert = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M10.3 3.3 1.8 18a1.5 1.5 0 0 0 1.3 2.2h17.8a1.5 1.5 0 0 0 1.3-2.2L13.7 3.3a1.5 1.5 0 0 0-2.6 0Z" />
    <path d="M12 9v4" />
    <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
  </svg>
);

export const IconMenu = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const IconClose = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconFilter = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M3 5h18l-7 8v6l-4 2v-8Z" />
  </svg>
);

export const IconChart = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M4 20V10M11 20V4M18 20v-7" />
    <path d="M2 20h20" />
  </svg>
);

export const IconPalette = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M12 21a9 9 0 1 1 0-18c4.5 0 8.5 3.3 8.5 7.2 0 2.4-1.8 3.8-3.6 3.8h-2a1.8 1.8 0 0 0-1.1 3.2c.4.4.6.9.6 1.4 0 1.3-1.1 2.4-2.4 2.4Z" />
    <circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="11" cy="7" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconDots = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSparkle = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="M12 8.5a3.5 3.5 0 0 0 3.5 3.5 3.5 3.5 0 0 0-3.5 3.5 3.5 3.5 0 0 0-3.5-3.5A3.5 3.5 0 0 0 12 8.5Z" />
  </svg>
);

export const IconClipboard = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
    <path d="M8 11h8M8 15h8M8 19h5" />
  </svg>
);

export const IconUser = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

export const IconLock = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    <circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);

export const IconLogout = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const IconChevronDown = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const IconArrowLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M19 12H5" />
    <path d="M11 18l-6-6 6-6" />
  </svg>
);

export const IconDownload = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M4 19.5h16" />
  </svg>
);

export const IconUpload = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M12 21V9" />
    <path d="m7 14 5-5 5 5" />
    <path d="M4 19.5h16" />
  </svg>
);

export const IconCheck = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconImage = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <circle cx="8.5" cy="9.5" r="1.6" fill="currentColor" stroke="none" />
    <path d="m4 17 5-5 3.5 3.5L17 11l3 3.5" />
  </svg>
);

export const IconCalendar = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

export const IconLayoutGrid = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" />
    <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.8" />
    <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.8" />
    <rect x="13" y="13" width="7.5" height="7.5" rx="1.8" />
  </svg>
);

export const IconWhatsApp = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M4 20.5 5.3 16A8.5 8.5 0 1 1 8.7 19.4Z" />
    <path d="M8.7 8.8c.2-.5.4-.5.6-.5h.5c.15 0 .35 0 .5.4.2.5.65 1.7.7 1.85.05.15.1.3 0 .5-.1.2-.15.3-.3.45-.15.15-.3.3-.15.55.15.3.7 1.1 1.5 1.8 1 .9 1.8 1.2 2.1 1.35.3.15.45.1.6-.05.15-.15.65-.75.85-1 .2-.25.4-.2.65-.1.25.1 1.6.75 1.85.9.25.15.4.2.45.35.06.15.06.75-.2 1.45-.25.7-1.45 1.35-2 1.4-.5.05-1.15.05-1.85-.1-.4-.1-.95-.3-1.65-.6-2.9-1.25-4.8-4.15-4.95-4.35-.15-.2-1.15-1.55-1.15-2.95 0-1.4.75-2.1 1-2.35Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconCoupon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.8 1.8 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.8 1.8 0 0 0 0-3Z" />
    <path d="M9.5 7v10" strokeDasharray="2 2.2" />
  </svg>
);

export const IconTrophy = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base(props)}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0Z" />
    <path d="M7 5H4v1.5A3.5 3.5 0 0 0 7 10" />
    <path d="M17 5h3v1.5A3.5 3.5 0 0 1 17 10" />
    <path d="M12 13.5V17" />
    <path d="M8.5 20h7" />
    <path d="M10 17h4l.6 3H9.4Z" />
  </svg>
);
