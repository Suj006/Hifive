export const THEME_STORAGE_KEY = "hifive-theme-colors";

export const THEME_VARS = {
  pink: "--brand-pink",
  pink2: "--brand-pink-2",
  purple: "--brand-purple",
  purple2: "--brand-purple-2",
  teal: "--brand-teal",
  gold: "--brand-gold",
} as const;

export type ThemeColors = Record<keyof typeof THEME_VARS, string>;

export const DEFAULT_THEME: ThemeColors = {
  pink: "#ec1876",
  pink2: "#ff4f9a",
  purple: "#7b2ff7",
  purple2: "#a566ff",
  teal: "#14c7d6",
  gold: "#ffb800",
};

export const THEME_PRESETS: { name: string; colors: ThemeColors }[] = [
  { name: "Hi Five (default)", colors: DEFAULT_THEME },
  {
    name: "Ocean",
    colors: {
      pink: "#0ea5e9",
      pink2: "#38bdf8",
      purple: "#6366f1",
      purple2: "#818cf8",
      teal: "#06b6d4",
      gold: "#f59e0b",
    },
  },
  {
    name: "Berry",
    colors: {
      pink: "#db2777",
      pink2: "#f472b6",
      purple: "#9333ea",
      purple2: "#c084fc",
      teal: "#14b8a6",
      gold: "#eab308",
    },
  },
  {
    name: "Sunset",
    colors: {
      pink: "#f97316",
      pink2: "#fb923c",
      purple: "#e11d48",
      purple2: "#fb7185",
      teal: "#f59e0b",
      gold: "#facc15",
    },
  },
  {
    name: "Mint",
    colors: {
      pink: "#059669",
      pink2: "#34d399",
      purple: "#0d9488",
      purple2: "#5eead4",
      teal: "#22c55e",
      gold: "#a3e635",
    },
  },
];

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value);
}

export function applyTheme(colors: Partial<ThemeColors>) {
  if (typeof document === "undefined") return;
  const root = document.documentElement.style;
  for (const key of Object.keys(THEME_VARS) as (keyof typeof THEME_VARS)[]) {
    const value = colors[key];
    if (value && isValidHex(value)) {
      root.setProperty(THEME_VARS[key], value);
    }
  }
}

export function resetTheme() {
  if (typeof document === "undefined") return;
  const root = document.documentElement.style;
  for (const cssVar of Object.values(THEME_VARS)) {
    root.removeProperty(cssVar);
  }
}

export function readCurrentTheme(): ThemeColors {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const computed = getComputedStyle(document.documentElement);
  const result = { ...DEFAULT_THEME };
  for (const key of Object.keys(THEME_VARS) as (keyof typeof THEME_VARS)[]) {
    const value = computed.getPropertyValue(THEME_VARS[key]).trim();
    if (value) result[key] = value;
  }
  return result;
}

/** Inline script text applied before hydration to avoid a flash of default colors. */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (!raw) return;
    var colors = JSON.parse(raw);
    var vars = ${JSON.stringify(THEME_VARS)};
    var root = document.documentElement.style;
    var hexRe = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    Object.keys(vars).forEach(function (key) {
      var value = colors[key];
      if (value && hexRe.test(value)) root.setProperty(vars[key], value);
    });
  } catch (e) {}
})();
`;
