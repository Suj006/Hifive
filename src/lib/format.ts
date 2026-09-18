const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

// Indian numbering (Lakh/Crore) compact suffixes — computed manually rather than
// via Intl's `notation: "compact"`, whose short-form units for en-IN vary across
// ICU builds (browser vs Node) and can render ambiguous/misleading abbreviations.
function formatCompactINR(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return inrFormatter.format(amount);
}

export function formatINR(amount: number, compact = false): string {
  if (!Number.isFinite(amount)) return "₹0";
  return compact ? formatCompactINR(amount) : inrFormatter.format(amount);
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
    value
  );
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function toDateInputValue(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  // Local calendar-date components, not toISOString() (which converts to
  // UTC first) — for anyone east of UTC (e.g. India, UTC+5:30), a local
  // midnight Date shifted to UTC lands on the previous day, so "This year"
  // was starting from 31 Dec instead of 1 Jan, and a new entry's default
  // date rolled back to yesterday before ~5:30am local time.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayInputValue(): string {
  return toDateInputValue(new Date());
}
