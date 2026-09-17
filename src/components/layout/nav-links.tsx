import {
  IconDashboard,
  IconLayers,
  IconTruck,
  IconUsers,
  IconCartDown,
  IconTag,
  IconFilter,
  IconChart,
  IconSparkle,
  IconClipboard,
} from "@/components/icons";

export const dashboardLink = { href: "/", label: "Dashboard", icon: IconDashboard } as const;

// Master data — grouped under a single "Masters" menu in the sidebar.
export const masterLinks = [
  { href: "/items", label: "Item Master", icon: IconLayers },
  { href: "/product-names", label: "Product Names", icon: IconClipboard },
  { href: "/categories", label: "Categories", icon: IconFilter },
  { href: "/vendors", label: "Vendors", icon: IconTruck },
  { href: "/customers", label: "Customers", icon: IconUsers },
] as const;

// Day-to-day transactions.
export const transactionLinks = [
  { href: "/purchases", label: "Purchases", icon: IconCartDown },
  { href: "/production", label: "Production", icon: IconSparkle },
  { href: "/sales", label: "Sales", icon: IconTag },
] as const;

export const reportLinks = [
  { href: "/reports", label: "Reports", icon: IconChart },
] as const;

// Flat list of every link — used by the mobile "More" sheet.
export const navLinks = [
  dashboardLink,
  ...masterLinks,
  ...transactionLinks,
  ...reportLinks,
] as const;

// Primary tabs shown directly in the mobile bottom bar; the rest live under "More".
export const mobilePrimaryHrefs = ["/", "/purchases", "/production", "/sales"] as const;
