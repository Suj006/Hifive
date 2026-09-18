"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  dashboardLink,
  masterLinks,
  transactionLinks,
  reportLinks,
  adminLinks,
} from "@/components/layout/nav-links";
import { BrandWordmark } from "@/components/brand/logo-mark";
import { ThemeCustomizerButton } from "@/components/theme/theme-customizer";
import { ProfileMenu } from "@/components/auth/profile-menu";
import { useRole } from "@/lib/use-role";
import { IconChevronDown, IconLayers } from "@/components/icons";

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  indent,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        indent && "py-2",
        active
          ? "bg-[image:var(--gradient-brand-soft)] text-foreground"
          : "text-muted hover:bg-white/5 hover:text-foreground"
      )}
    >
      {active ? (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[image:var(--gradient-brand)]" />
      ) : null}
      <Icon
        className={cn(
          indent ? "h-4 w-4" : "h-[18px] w-[18px]",
          active ? "text-brand-pink-2" : "text-muted group-hover:text-foreground"
        )}
      />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mastersOpen, setMastersOpen] = useState(false);
  const { isAdmin } = useRole();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);
  const isMastersActive = masterLinks.some((l) => isActive(l.href));
  const mastersExpanded = mastersOpen || isMastersActive;

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface/60 px-4 py-6 lg:flex">
      <div className="px-2">
        <BrandWordmark />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto scrollbar-thin">
        <NavItem
          href={dashboardLink.href}
          label={dashboardLink.label}
          icon={dashboardLink.icon}
          active={!!isActive(dashboardLink.href)}
        />

        <button
          onClick={() => setMastersOpen((o) => !o)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
            isMastersActive
              ? "text-foreground"
              : "text-muted hover:bg-white/5 hover:text-foreground"
          )}
        >
          <IconLayers
            className={cn("h-[18px] w-[18px]", isMastersActive && "text-brand-pink-2")}
          />
          <span className="flex-1 text-left">Masters</span>
          <IconChevronDown
            className={cn(
              "h-4 w-4 text-muted transition-transform",
              mastersExpanded && "rotate-180"
            )}
          />
        </button>
        {mastersExpanded ? (
          <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-3">
            {masterLinks.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                active={!!isActive(link.href)}
                indent
              />
            ))}
          </div>
        ) : null}

        <div className="my-2 border-t border-border" />

        {transactionLinks.map((link) => (
          <NavItem
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            active={!!isActive(link.href)}
          />
        ))}

        <div className="my-2 border-t border-border" />

        {reportLinks.map((link) => (
          <NavItem
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            active={!!isActive(link.href)}
          />
        ))}

        {isAdmin ? (
          <>
            <div className="my-2 border-t border-border" />
            {adminLinks.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                active={!!isActive(link.href)}
              />
            ))}
          </>
        ) : null}
      </nav>

      <div className="flex flex-col gap-3">
        <ProfileMenu />
        <ThemeCustomizerButton />
        <div className="rounded-xl border border-border bg-surface-2/60 p-3.5">
          <p className="text-xs font-semibold text-foreground">Handmade with love</p>
          <p className="mt-0.5 text-xs text-muted">
            All amounts recorded in INR (₹)
          </p>
        </div>
      </div>
    </aside>
  );
}
