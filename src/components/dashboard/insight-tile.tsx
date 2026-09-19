import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const ACCENT_GRADIENT: Record<string, string> = {
  pink: "from-brand-pink/25 to-transparent",
  purple: "from-brand-purple/25 to-transparent",
  teal: "from-brand-teal/25 to-transparent",
  gold: "from-brand-gold/25 to-transparent",
};
const ICON_BG: Record<string, string> = {
  pink: "bg-brand-pink/15 text-brand-pink-2",
  purple: "bg-brand-purple/15 text-brand-purple-2",
  teal: "bg-brand-teal/15 text-brand-teal",
  gold: "bg-brand-gold/15 text-brand-gold",
};

export function InsightTile({
  icon,
  label,
  title,
  value,
  sub,
  accent = "pink",
}: {
  icon: ReactNode;
  label: string;
  title: string;
  value?: string;
  sub?: string;
  accent?: "pink" | "purple" | "teal" | "gold";
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border p-4 glass-card">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div
          className={cn(
            "absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl",
            ACCENT_GRADIENT[accent]
          )}
        />
      </div>
      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            ICON_BG[accent]
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-0.5 truncate font-display text-base font-bold" title={title}>
            {title}
          </p>
          {value ? <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p> : null}
          {sub ? <p className="mt-0.5 truncate text-xs text-muted" title={sub}>{sub}</p> : null}
        </div>
      </div>
    </div>
  );
}
