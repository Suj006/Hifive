"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { navLinks, mobilePrimaryHrefs } from "@/components/layout/nav-links";
import { BrandWordmark } from "@/components/brand/logo-mark";
import { IconDots, IconClose } from "@/components/icons";
import { ThemeCustomizerButton } from "@/components/theme/theme-customizer";

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
      <Link href="/">
        <BrandWordmark />
      </Link>
    </header>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryLinks = navLinks.filter((l) =>
    (mobilePrimaryHrefs as readonly string[]).includes(l.href)
  );
  const moreLinks = navLinks.filter(
    (l) => !(mobilePrimaryHrefs as readonly string[]).includes(l.href)
  );
  const moreActive = moreLinks.some((l) => pathname?.startsWith(l.href));

  return (
    <>
      {moreOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-border bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-base font-semibold">More</p>
              <button
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-foreground cursor-pointer"
                aria-label="Close"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {moreLinks.map((link) => {
                const active = pathname?.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border border-border py-3 text-xs font-medium transition-colors",
                      active
                        ? "bg-[image:var(--gradient-brand-soft)] text-foreground"
                        : "text-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-3">
              <ThemeCustomizerButton className="w-full justify-center" />
            </div>
          </div>
        </div>
      ) : null}

      <nav className="sticky bottom-0 z-30 grid grid-cols-5 gap-0.5 border-t border-border bg-surface/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {primaryLinks.map((link) => {
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
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors cursor-pointer",
            moreActive ? "text-brand-pink-2" : "text-muted"
          )}
        >
          <IconDots className="h-[18px] w-[18px]" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
