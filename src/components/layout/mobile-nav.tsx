"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { navLinks } from "@/components/layout/nav-links";

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-display text-base font-extrabold brand-text">
          Hi Five
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          by Jia
        </span>
      </Link>
    </header>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 grid grid-cols-6 gap-0.5 border-t border-border bg-surface/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      {navLinks.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
              active ? "text-brand-pink-2" : "text-muted"
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="truncate">{link.label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
