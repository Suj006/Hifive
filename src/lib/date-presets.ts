import { toDateInputValue, todayInputValue } from "@/lib/format";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}

export const DATE_PRESETS = [
  { key: "all", label: "All time" },
  { key: "month", label: "This month" },
  { key: "lastMonth", label: "Last month" },
  { key: "year", label: "This year" },
] as const;

export type DatePresetKey = (typeof DATE_PRESETS)[number]["key"];

export function datePresetRange(key: DatePresetKey): { from: string; to: string } {
  const now = new Date();
  if (key === "month") return { from: toDateInputValue(startOfMonth(now)), to: todayInputValue() };
  if (key === "lastMonth") {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { from: toDateInputValue(startOfMonth(lastMonth)), to: toDateInputValue(endOfMonth(lastMonth)) };
  }
  if (key === "year") return { from: toDateInputValue(startOfYear(now)), to: todayInputValue() };
  return { from: "", to: "" };
}
