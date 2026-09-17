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

export const navLinks = [
  { href: "/", label: "Dashboard", icon: IconDashboard },
  { href: "/items", label: "Item Master", icon: IconLayers },
  { href: "/purchases", label: "Purchases", icon: IconCartDown },
  { href: "/production", label: "Production", icon: IconSparkle },
  { href: "/sales", label: "Sales", icon: IconTag },
  { href: "/product-names", label: "Product Names", icon: IconClipboard },
  { href: "/categories", label: "Categories", icon: IconFilter },
  { href: "/vendors", label: "Vendors", icon: IconTruck },
  { href: "/customers", label: "Customers", icon: IconUsers },
  { href: "/reports", label: "Reports", icon: IconChart },
] as const;

// Primary tabs shown directly in the mobile bottom bar; the rest live under "More".
export const mobilePrimaryHrefs = ["/", "/items", "/purchases", "/sales"] as const;
