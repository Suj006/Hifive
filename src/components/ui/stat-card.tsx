"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export interface StatCardDetailRow {
  label: string;
  sub?: string;
  value: string;
}

export interface StatCardDetails {
  title: string;
  rows: StatCardDetailRow[];
  emptyText: string;
}

export function StatCard({
  label,
  value,
  icon,
  accent = "pink",
  trend,
  sub,
  details,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  accent?: "pink" | "purple" | "teal" | "gold";
  trend?: { direction: "up" | "down"; label: string } | null;
  sub?: string;
  details?: StatCardDetails;
}) {
  // Hover shows it on desktop; a tap toggles it open on touch devices where
  // there's no hover state to begin with.
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const open = details ? pinned || hovered : false;

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
      className="relative rounded-2xl border border-border p-5 glass-card"
      onMouseEnter={() => details && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div
          className={cn(
            "absolute -right-8 -top-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl",
            accentGradient[accent]
          )}
        />
      </div>
      <div
        className={cn("relative flex items-start justify-between", details && "cursor-help")}
        onClick={() => details && setPinned((p) => !p)}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {label}
            {details ? (
              <span className="ml-1 text-muted/60" aria-hidden="true">
                ⓘ
              </span>
            ) : null}
          </p>
          <p className="mt-2 whitespace-nowrap font-display text-2xl font-bold tracking-tight sm:text-3xl">
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

      {details && open ? (
        <div
          className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-border bg-surface p-3.5 shadow-2xl animate-pop-in"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {details.title}
          </p>
          {details.rows.length === 0 ? (
            <p className="text-xs text-muted">{details.emptyText}</p>
          ) : (
            <ul className="space-y-2">
              {details.rows.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate">
                    <span className="font-medium text-foreground">{r.label}</span>
                    {r.sub ? <span className="text-muted"> · {r.sub}</span> : null}
                  </span>
                  <span className="shrink-0 font-semibold text-foreground">{r.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
