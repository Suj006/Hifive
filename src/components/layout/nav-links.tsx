import {
  IconDashboard,
  IconLayers,
  IconTruck,
  IconUsers,
  IconCartDown,
  IconTag,
} from "@/components/icons";

export const navLinks = [
  { href: "/", label: "Dashboard", icon: IconDashboard },
  { href: "/items", label: "Item Master", icon: IconLayers },
  { href: "/purchases", label: "Purchases", icon: IconCartDown },
  { href: "/sales", label: "Sales", icon: IconTag },
  { href: "/vendors", label: "Vendors", icon: IconTruck },
  { href: "/customers", label: "Customers", icon: IconUsers },
] as const;
