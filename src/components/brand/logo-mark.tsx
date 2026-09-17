import Image from "next/image";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.jpeg"
      alt="Hi Five by Jia"
      width={64}
      height={64}
      className={cn("h-9 w-9 rounded-xl object-cover", className)}
      priority
    />
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <div className="leading-tight">
        <p className="font-display text-lg font-extrabold tracking-tight brand-text">
          Hi Five
        </p>
        <p className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          by Jia
        </p>
      </div>
    </div>
  );
}
