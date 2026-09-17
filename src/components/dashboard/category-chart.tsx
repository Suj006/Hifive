"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { ResponsiveContainer } from "recharts";
import { EmptyState } from "@/components/ui/empty-state";
import { IconFilter } from "@/components/icons";
import { formatINR } from "@/lib/format";

// Single-hue magnitude ramp (chart-safe, validated teal) — this is a
// "compare magnitude" chart, not identity, so every bar shares one hue.
const BAR_COLOR = "#129aa8";
const BAR_COLOR_DIM = "#0d6e78";

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { category: string; amount: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs shadow-xl">
      <p className="font-semibold text-foreground">{row.category}</p>
      <p className="text-muted">{formatINR(row.amount)}</p>
    </div>
  );
}

export function CategoryChart({
  data,
}: {
  data: { category: string; amount: number }[];
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<IconFilter className="h-6 w-6 text-brand-teal" />}
        title="No sales yet"
        description="Once you record sales, the category breakdown shows up here."
      />
    );
  }

  const height = Math.max(160, data.length * 40);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          barCategoryGap={10}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            stroke="var(--muted)"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatINR(v, true)}
          />
          <YAxis
            type="category"
            dataKey="category"
            stroke="var(--muted)"
            tick={{ fill: "var(--foreground)", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip content={<CategoryTooltip />} cursor={{ fill: "var(--surface-2)" }} />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry, i) => (
              <Cell key={entry.category} fill={i === 0 ? BAR_COLOR : BAR_COLOR_DIM} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
