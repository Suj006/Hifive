import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const SOLID_GRADIENTS: Record<string, string> = {
  pink: "linear-gradient(135deg, #ec1876 0%, #ff6fa8 100%)",
  purple: "linear-gradient(135deg, #7b2ff7 0%, #a566ff 100%)",
  teal: "linear-gradient(135deg, #0ea5ae 0%, #14c7d6 100%)",
  gold: "linear-gradient(135deg, #e6960a 0%, #ffb800 100%)",
};

export function QuickActionTile({
  href,
  icon,
  title,
  subtitle,
  tone,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  tone: keyof typeof SOLID_GRADIENTS;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl"
      style={{ background: SOLID_GRADIENTS[tone] }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl transition-transform group-hover:scale-125" />
      <div className="relative flex items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-display text-base font-bold leading-tight">{title}</p>
          <p className="text-xs text-white/80">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}

const CHIP_TONES: Record<string, string> = {
  pink: "bg-brand-pink/15 text-brand-pink-2",
  purple: "bg-brand-purple/15 text-brand-purple-2",
  teal: "bg-brand-teal/15 text-brand-teal",
  gold: "bg-brand-gold/15 text-brand-gold",
};

export function ManageTile({
  href,
  icon,
  label,
  count,
  tone,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  count?: number;
  tone: keyof typeof CHIP_TONES;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface/60 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-purple-2/50 hover:bg-surface"
      )}
    >
      <div className="flex w-full items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", CHIP_TONES[tone])}>
          {icon}
        </div>
        {typeof count === "number" ? (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-semibold text-muted">
            {count}
          </span>
        ) : null}
      </div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
    </Link>
  );
}
