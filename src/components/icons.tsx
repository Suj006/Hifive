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
