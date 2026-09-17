import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-8 w-8", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hifive-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#EC1876" />
          <stop offset="0.55" stopColor="#7B2FF7" />
          <stop offset="1" stopColor="#14C7D6" />
        </linearGradient>
      </defs>
      <path
        d="M24 6c-6 0-9 4.5-9 9v11.5c0 1-1.5 1-1.8-.2l-1.6-6.1c-.4-1.6-2.5-2-3.5-.6-.5.7-.6 1.6-.3 2.4l3.4 9.6C12.6 37.4 18 42 24.5 42c8 0 13.5-6 13.5-14V16c0-1.4-1.1-2.5-2.5-2.5S33 14.6 33 16v8"
        stroke="url(#hifive-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 15c0-1.4 1.1-2.5 2.5-2.5S29 13.6 29 15v9M29 24v-6.5c0-1.4 1.1-2.5 2.5-2.5S34 16.1 34 17.5V24"
        stroke="url(#hifive-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 15c0-1.4 1.1-2.5 2.5-2.5S20 13.6 20 15v9"
        stroke="url(#hifive-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="4.5" fill="url(#hifive-grad)" />
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
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
