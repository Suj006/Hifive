"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { navLinks } from "@/components/layout/nav-links";
import { BrandWordmark } from "@/components/brand/logo-mark";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface/60 px-4 py-6 lg:flex">
      <div className="px-2">
        <BrandWordmark />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navLinks.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
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
                  "h-[18px] w-[18px]",
                  active ? "text-brand-pink-2" : "text-muted group-hover:text-foreground"
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-border bg-surface-2/60 p-3.5">
        <p className="text-xs font-semibold text-foreground">Handmade with love</p>
        <p className="mt-0.5 text-xs text-muted">
          All amounts recorded in INR (₹)
        </p>
      </div>
    </aside>
  );
}
