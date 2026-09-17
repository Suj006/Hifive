"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { EmptyState } from "@/components/ui/empty-state";
import { IconChart } from "@/components/icons";
import { formatINR } from "@/lib/format";

// Chart-safe variants of the brand hues (darkened/adjusted so they clear the
// dataviz contrast + colorblind-separation checks against the app's dark
// surface — the raw brand teal/gold are too light for thin chart marks).
const CHART_PURPLE = "#a566ff";
const CHART_PINK = "#ec1876";

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs shadow-xl">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5 text-muted">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          {p.name}: <span className="font-semibold text-foreground">{formatINR(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function TrendChart({
  data,
}: {
  data: { label: string; purchases: number; sales: number }[];
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<IconChart className="h-6 w-6 text-brand-purple-2" />}
        title="Nothing to chart yet"
        description="Record a few purchases and sales to see the trend here."
      />
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--muted)"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
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
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: "var(--border)" }} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "var(--muted)" }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="purchases"
            name="Purchases"
            stroke={CHART_PURPLE}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART_PURPLE, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="sales"
            name="Sales"
            stroke={CHART_PINK}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART_PINK, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
