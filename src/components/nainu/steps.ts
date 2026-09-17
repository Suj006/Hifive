import type { ComponentType, SVGProps } from "react";
import {
  IconLayers,
  IconCartDown,
  IconSparkle,
  IconTag,
  IconChart,
} from "@/components/icons";

export interface NainuStep {
  title: string;
  body: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: "pink" | "purple" | "teal" | "gold";
  href?: string;
  cta?: string;
}

export const nainuSteps: NainuStep[] = [
  {
    title: "Hi, I'm Nainu! 👋",
    body: "I'll show you around Hi Five by Jia in a few quick steps — tap Next whenever you're ready, or skip and explore on your own.",
    icon: IconSparkle,
    tone: "purple",
  },
  {
    title: "1. Set up your Masters",
    body: "Start with the Masters menu — Item Master, Product Names, Categories, Vendors and Customers. This is the foundation everything else is built on.",
    icon: IconLayers,
    tone: "teal",
    href: "/items",
    cta: "Open Item Master",
  },
  {
    title: "2. Record a Purchase",
    body: "Bought beads, thread or charms? Log it under Purchases — it keeps a running record of every raw material buy, vendor-wise.",
    icon: IconCartDown,
    tone: "purple",
    href: "/purchases",
    cta: "Open Purchases",
  },
  {
    title: "3. Log your Production",
    body: "Made something new? Add it under Production — it adds straight to that product's stock, ready to be sold.",
    icon: IconSparkle,
    tone: "teal",
    href: "/production",
    cta: "Open Production",
  },
  {
    title: "4. Record a Sale",
    body: "Every time a customer buys a finished piece, log it under Sales — I'll keep your stock and profit numbers up to date.",
    icon: IconTag,
    tone: "pink",
    href: "/sales",
    cta: "Open Sales",
  },
  {
    title: "5. Check your Reports",
    body: "Head to Reports anytime for purchase, sales & stock insights — with date/category filters and one-click CSV or PNG export.",
    icon: IconChart,
    tone: "gold",
    href: "/reports",
    cta: "Open Reports",
  },
  {
    title: "That's it! 💖",
    body: "You're all set. Click me anytime — bottom-right of the Dashboard — and I'll walk you through it again.",
    icon: IconSparkle,
    tone: "pink",
  },
];
