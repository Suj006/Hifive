import { cn } from "@/lib/cn";

type Tone = "pink" | "purple" | "teal" | "gold" | "success" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  pink: "bg-brand-pink/15 text-brand-pink-2 border-brand-pink/30",
  purple: "bg-brand-purple/15 text-brand-purple-2 border-brand-purple/30",
  teal: "bg-brand-teal/15 text-brand-teal border-brand-teal/30",
  gold: "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
  success: "bg-success/15 text-success border-success/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  neutral: "bg-white/5 text-muted border-border",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
