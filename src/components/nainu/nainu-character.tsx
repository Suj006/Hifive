import { cn } from "@/lib/cn";

// Nainu — Hi Five by Jia's mascot: a cheerful little girl character rendered
// as layered SVG (gradient fills + a soft highlight) for a glossy, toy-like
// 3D look without pulling in a real 3D renderer. A stylized cartoon design,
// not a likeness of any real person. Animation is pure CSS (see
// .animate-nainu-* in globals.css) so it costs nothing to mount.
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
      height={size * (132 / 120)}
      viewBox="0 0 120 132"
      className={cn(bobbing && "animate-nainu-bob", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nainu-dress" x1="24" y1="82" x2="96" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff6fa8" />
          <stop offset="55%" stopColor="#a566ff" />
          <stop offset="100%" stopColor="#14c7d6" />
        </linearGradient>
        <linearGradient id="nainu-bow" x1="42" y1="8" x2="78" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffd66b" />
          <stop offset="100%" stopColor="#ffb800" />
        </linearGradient>
        <linearGradient id="nainu-hair" x1="26" y1="24" x2="94" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4a2f1e" />
          <stop offset="100%" stopColor="#1c120c" />
        </linearGradient>
        <linearGradient id="nainu-skin" x1="34" y1="34" x2="86" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f6cba3" />
          <stop offset="100%" stopColor="#dfa471" />
        </linearGradient>
        <radialGradient id="nainu-shine" cx="0.35" cy="0.28" r="0.5">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="60" cy="127" rx="25" ry="4.5" fill="#000000" opacity="0.25" />

      {/* sparkles */}
      <g className="animate-nainu-sparkle" style={{ animationDelay: "0.2s" }}>
        <path d="M15 48 l2.2 5.5 5.5 2.2 -5.5 2.2 -2.2 5.5 -2.2 -5.5 -5.5 -2.2 5.5 -2.2Z" fill="#ffd66b" />
      </g>
      <g className="animate-nainu-sparkle" style={{ animationDelay: "0.9s" }}>
        <path d="M104 64 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6Z" fill="#ff9fc7" />
      </g>

      {/* arms */}
      <g className={cn(waving && "animate-nainu-wave")}>
        <ellipse cx="90" cy="98" rx="7.5" ry="12" fill="url(#nainu-dress)" transform="rotate(26 90 98)" />
      </g>
      <ellipse cx="30" cy="102" rx="7" ry="11" fill="url(#nainu-dress)" transform="rotate(-18 30 102)" />
      {/* tiny bracelet held in left hand */}
      <circle cx="23" cy="111" r="5.5" fill="none" stroke="#ffd66b" strokeWidth="2.2" />
      <circle cx="23" cy="111" r="1.3" fill="#ff6fa8" />

      {/* dress / body */}
      <path
        d="M32 132 Q28 104 38 90 Q60 80 82 90 Q92 104 88 132 Z"
        fill="url(#nainu-dress)"
      />
      <path
        d="M32 132 Q28 104 38 90 Q60 80 82 90 Q92 104 88 132 Z"
        fill="url(#nainu-shine)"
      />

      {/* neck */}
      <rect x="53" y="76" width="14" height="14" rx="6" fill="url(#nainu-skin)" />

      {/* hair back / shoulder-length sides */}
      <ellipse cx="60" cy="54" rx="33" ry="31" fill="url(#nainu-hair)" />
      <ellipse cx="30" cy="82" rx="10" ry="24" fill="url(#nainu-hair)" transform="rotate(-6 30 82)" />
      <ellipse cx="90" cy="82" rx="10" ry="24" fill="url(#nainu-hair)" transform="rotate(6 90 82)" />

      {/* head */}
      <ellipse cx="60" cy="56" rx="25.5" ry="24.5" fill="url(#nainu-skin)" />
      <ellipse cx="60" cy="56" rx="25.5" ry="24.5" fill="url(#nainu-shine)" />

      {/* ears + earrings */}
      <ellipse cx="35" cy="58" rx="3.4" ry="5.2" fill="url(#nainu-skin)" />
      <ellipse cx="85" cy="58" rx="3.4" ry="5.2" fill="url(#nainu-skin)" />
      <circle cx="35" cy="63" r="1.6" fill="#ffb800" />
      <circle cx="85" cy="63" r="1.6" fill="#ffb800" />

      {/* bangs */}
      <path
        d="M35 46 C 38 28 48 22 60 22 C 72 22 82 28 85 46 C 77 37 68 34 60 35 C 52 34 43 37 35 46 Z"
        fill="url(#nainu-hair)"
      />

      {/* bow */}
      <path d="M60 18 L41 7 Q35 5 35 13 Q35 21 45 20 Z" fill="url(#nainu-bow)" />
      <path d="M60 18 L79 7 Q85 5 85 13 Q85 21 75 20 Z" fill="url(#nainu-bow)" />
      <circle cx="60" cy="18" r="5" fill="#ffb800" />

      {/* bindi */}
      <circle cx="60" cy="48" r="2.1" fill="#c8265a" />

      {/* eyebrows */}
      <path d="M41 51 Q47 46 53 50" stroke="#2a1a12" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M67 50 Q73 46 79 51" stroke="#2a1a12" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* eyes */}
      <g className="animate-nainu-blink">
        <ellipse cx="47" cy="60" rx="7" ry="8.6" fill="#ffffff" />
        <ellipse cx="73" cy="60" rx="7" ry="8.6" fill="#ffffff" />
        <circle cx="48.2" cy="61.5" r="4.1" fill="#3a2415" />
        <circle cx="74.2" cy="61.5" r="4.1" fill="#3a2415" />
        <circle cx="46.5" cy="58.8" r="1.5" fill="#ffffff" />
        <circle cx="72.5" cy="58.8" r="1.5" fill="#ffffff" />
      </g>

      {/* blush */}
      <ellipse cx="39" cy="69" rx="5.5" ry="3.2" fill="#ff6fa8" opacity="0.4" />
      <ellipse cx="81" cy="69" rx="5.5" ry="3.2" fill="#ff6fa8" opacity="0.4" />

      {/* mouth */}
      <path
        d="M47 73 Q60 84 73 73"
        stroke="#8a3a1c"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className={cn(talking && "animate-nainu-talk")}
      />
    </svg>
  );
}
