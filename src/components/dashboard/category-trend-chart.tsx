"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { EmptyState } from "@/components/ui/empty-state";
import { IconChart } from "@/components/icons";
import { formatINR } from "@/lib/format";

// Fixed categorical order (validated CVD-safe as a set against the app's dark
// surface) — a category always gets the same color across renders; anything
// past the 4th named category folds into "Other" in muted gray rather than
// generating a 5th hue.
const CATEGORY_COLORS = ["#ec1876", "#a566ff", "#129aa8", "#b8790a"];
const OTHER_COLOR = "#8b87a3";

function colorFor(category: string, index: number): string {
  return category === "Other" ? OTHER_COLOR : CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

function CategoryTrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs shadow-xl">
      <p className="mb-1.5 flex items-center justify-between gap-4 font-semibold text-foreground">
        {label} <span>{formatINR(total)}</span>
      </p>
      {[...payload].reverse().map((p) => (
        <p key={p.name} className="flex items-center justify-between gap-4 text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">{formatINR(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function CategoryTrendChart({
  data,
  categories,
}: {
  data: Record<string, string | number>[];
  categories: string[];
}) {
  const hasAnySales = data.some((row) =>
    categories.some((cat) => Number(row[cat] ?? 0) > 0)
  );

  if (!hasAnySales) {
    return (
      <EmptyState
        icon={<IconChart className="h-6 w-6 text-brand-purple-2" />}
        title="No sales in the last 3 months"
        description="Once you record sales, the month-by-month category trend shows up here."
      />
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--muted)"
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            stroke="var(--muted)"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatINR(v, true)}
            width={56}
          />
          <Tooltip content={<CategoryTrendTooltip />} cursor={{ fill: "var(--surface-2)" }} />
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted)" }} iconType="circle" iconSize={8} />
          {categories.map((cat, i) => (
            <Bar
              key={cat}
              dataKey={cat}
              name={cat}
              stackId="total"
              fill={colorFor(cat, i)}
              stroke="var(--surface)"
              strokeWidth={2}
              radius={i === categories.length - 1 ? [4, 4, 0, 0] : undefined}
              maxBarSize={64}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
