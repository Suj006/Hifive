import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  accent = "pink",
  trend,
  sub,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  accent?: "pink" | "purple" | "teal" | "gold";
  trend?: { direction: "up" | "down"; label: string } | null;
  sub?: string;
}) {
  const accentGradient: Record<string, string> = {
    pink: "from-brand-pink/25 to-transparent",
    purple: "from-brand-purple/25 to-transparent",
    teal: "from-brand-teal/25 to-transparent",
    gold: "from-brand-gold/25 to-transparent",
  };
  const iconBg: Record<string, string> = {
    pink: "bg-brand-pink/15 text-brand-pink-2",
    purple: "bg-brand-purple/15 text-brand-purple-2",
    teal: "bg-brand-teal/15 text-brand-teal",
    gold: "bg-brand-gold/15 text-brand-gold",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border p-5 glass-card"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl",
          accentGradient[accent]
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {value}
          </p>
          {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
          {trend ? (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1 text-xs font-semibold",
                trend.direction === "up" ? "text-success" : "text-danger"
              )}
            >
              {trend.direction === "up" ? "▲" : "▼"} {trend.label}
            </p>
          ) : null}
        </div>
        {icon ? (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              iconBg[accent]
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
