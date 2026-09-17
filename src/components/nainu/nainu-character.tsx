import { cn } from "@/lib/cn";

// Nainu — Hi Five by Jia's mascot: a friendly little "bead buddy" rendered as
// layered SVG (gradient fills + a soft highlight) for a glossy, toy-like 3D
// look without pulling in a real 3D renderer. Animation is pure CSS
// (see .animate-nainu-* in globals.css) so it costs nothing to mount.
export function NainuCharacter({
  size = 72,
  talking = false,
  waving = false,
  bobbing = true,
  className,
}: {
  size?: number;
  talking?: boolean;
  waving?: boolean;
  bobbing?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cn(bobbing && "animate-nainu-bob", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nainu-body" x1="20" y1="20" x2="100" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff6fa8" />
          <stop offset="55%" stopColor="#a566ff" />
          <stop offset="100%" stopColor="#14c7d6" />
        </linearGradient>
        <linearGradient id="nainu-bow" x1="30" y1="14" x2="90" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffd66b" />
          <stop offset="100%" stopColor="#ffb800" />
        </linearGradient>
        <radialGradient id="nainu-shine" cx="0.35" cy="0.3" r="0.5">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="60" cy="111" rx="26" ry="5.5" fill="#000000" opacity="0.28" />

      {/* sparkles */}
      <g className="animate-nainu-sparkle" style={{ animationDelay: "0.2s" }}>
        <path d="M18 40 l2.2 5.5 5.5 2.2 -5.5 2.2 -2.2 5.5 -2.2 -5.5 -5.5 -2.2 5.5 -2.2Z" fill="#ffd66b" />
      </g>
      <g className="animate-nainu-sparkle" style={{ animationDelay: "0.9s" }}>
        <path d="M101 58 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6Z" fill="#ff9fc7" />
      </g>

      {/* arms */}
      <g className={cn(waving && "animate-nainu-wave")}>
        <ellipse cx="90" cy="70" rx="8.5" ry="13" fill="url(#nainu-body)" transform="rotate(24 90 70)" />
      </g>
      <ellipse cx="30" cy="76" rx="8" ry="12" fill="url(#nainu-body)" transform="rotate(-18 30 76)" />
      {/* tiny bracelet held in left hand */}
      <circle cx="22" cy="86" r="6" fill="none" stroke="#ffd66b" strokeWidth="2.4" />
      <circle cx="22" cy="86" r="1.4" fill="#ff6fa8" />

      {/* body */}
      <ellipse cx="60" cy="66" rx="36" ry="34" fill="url(#nainu-body)" />
      <ellipse cx="60" cy="66" rx="36" ry="34" fill="url(#nainu-shine)" />

      {/* bow */}
      <path d="M60 20 L40 8 Q34 6 34 14 Q34 22 44 22 Z" fill="url(#nainu-bow)" />
      <path d="M60 20 L80 8 Q86 6 86 14 Q86 22 76 22 Z" fill="url(#nainu-bow)" />
      <circle cx="60" cy="20" r="5.5" fill="#ffb800" />

      {/* blush */}
      <ellipse cx="40" cy="76" rx="6" ry="3.5" fill="#ff6fa8" opacity="0.45" />
      <ellipse cx="80" cy="76" rx="6" ry="3.5" fill="#ff6fa8" opacity="0.45" />

      {/* eyes */}
      <g className="animate-nainu-blink">
        <ellipse cx="47" cy="64" rx="8.5" ry="10.5" fill="#ffffff" />
        <ellipse cx="73" cy="64" rx="8.5" ry="10.5" fill="#ffffff" />
        <circle cx="48.5" cy="66" r="5" fill="#3a1560" />
        <circle cx="74.5" cy="66" r="5" fill="#3a1560" />
        <circle cx="46.5" cy="63" r="1.8" fill="#ffffff" />
        <circle cx="72.5" cy="63" r="1.8" fill="#ffffff" />
      </g>

      {/* mouth */}
      <path
        d="M50 84 Q60 92 70 84"
        stroke="#3a1560"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className={cn(talking && "animate-nainu-talk")}
      />
    </svg>
  );
}
