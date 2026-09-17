"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { QuickActionTile, ManageTile } from "@/components/dashboard/tiles";
import { useApi } from "@/lib/use-api";
import type { DashboardData } from "@/lib/types";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import {
  IconWallet,
  IconCartDown,
  IconTrendUp,
  IconRupee,
  IconAlert,
  IconLayers,
  IconSparkle,
  IconTag,
  IconClipboard,
  IconFilter,
  IconTruck,
  IconUsers,
  IconChart,
} from "@/components/icons";

export default function DashboardPage() {
  const { data, loading, error } = useApi<DashboardData>("/api/dashboard");

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Hi Five by Jia — purchase & sale overview, all figures in INR."
        back={false}
      />

      {error ? (
        <Card className="p-6 text-sm text-danger">{error}</Card>
      ) : loading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-border bg-surface-2/50"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Purchases"
              value={formatINR(data.totals.purchases)}
              icon={<IconCartDown className="h-5 w-5" />}
              accent="purple"
              sub={`This month: ${formatINR(data.month.purchases)}`}
            />
            <StatCard
              label="Total Sales"
              value={formatINR(data.totals.sales)}
              icon={<IconRupee className="h-5 w-5" />}
              accent="pink"
              sub={`This month: ${formatINR(data.month.sales)}`}
            />
            <StatCard
              label="Net Profit"
              value={formatINR(data.totals.profit)}
              icon={<IconTrendUp className="h-5 w-5" />}
              accent="teal"
              trend={
                data.totals.profit >= 0
                  ? { direction: "up", label: "Sales ahead of purchases" }
                  : { direction: "down", label: "Purchases ahead of sales" }
              }
            />
            <StatCard
              label="Active Items"
              value={String(data.counts.items)}
              icon={<IconLayers className="h-5 w-5" />}
              accent="gold"
              sub={`${data.counts.vendors} vendors · ${data.counts.customers} customers`}
            />
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Quick actions
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <QuickActionTile
                href="/purchases"
                icon={<IconCartDown className="h-5 w-5" />}
                title="Record purchase"
                subtitle="Log a raw material buy"
                tone="purple"
              />
              <QuickActionTile
                href="/production"
                icon={<IconSparkle className="h-5 w-5" />}
                title="Record production"
                subtitle="Log items you've made"
                tone="teal"
              />
              <QuickActionTile
                href="/sales"
                icon={<IconTag className="h-5 w-5" />}
                title="Record sale"
                subtitle="Log a finished sale"
                tone="pink"
              />
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Manage
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              <ManageTile
                href="/items"
                icon={<IconLayers className="h-5 w-5" />}
                label="Item Master"
                count={data.counts.items}
                tone="pink"
              />
              <ManageTile
                href="/product-names"
                icon={<IconClipboard className="h-5 w-5" />}
                label="Product Names"
                tone="purple"
              />
              <ManageTile
                href="/categories"
                icon={<IconFilter className="h-5 w-5" />}
                label="Categories"
                tone="teal"
              />
              <ManageTile
                href="/vendors"
                icon={<IconTruck className="h-5 w-5" />}
                label="Vendors"
                count={data.counts.vendors}
                tone="gold"
              />
              <ManageTile
                href="/customers"
                icon={<IconUsers className="h-5 w-5" />}
                label="Customers"
                count={data.counts.customers}
                tone="pink"
              />
              <ManageTile
                href="/reports"
                icon={<IconChart className="h-5 w-5" />}
                label="Reports"
                tone="purple"
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentPurchases.length === 0 &&
                data.recentSales.length === 0 ? (
                  <EmptyState
                    icon={<IconWallet className="h-6 w-6 text-brand-purple-2" />}
                    title="Nothing recorded yet"
                    description="Add items to your master, then record a purchase or sale to see activity here."
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                        Latest purchases
                      </p>
                      <ul className="space-y-3">
                        {data.recentPurchases.map((p) => (
                          <li key={p.id} className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{p.item.name}</p>
                              <p className="text-xs text-muted">
                                {p.vendor.name} · {formatDate(p.date)}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold text-brand-purple-2">
                              {formatINR(p.amount)}
                            </span>
                          </li>
                        ))}
                        {data.recentPurchases.length === 0 ? (
                          <p className="text-sm text-muted">No purchases yet</p>
                        ) : null}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                        Latest sales
                      </p>
                      <ul className="space-y-3">
                        {data.recentSales.map((s) => (
                          <li key={s.id} className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{s.item.name}</p>
                              <p className="text-xs text-muted">
                                {s.customer.name} · {formatDate(s.date)}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold text-brand-pink-2">
                              {formatINR(s.amount)}
                            </span>
                          </li>
                        ))}
                        {data.recentSales.length === 0 ? (
                          <p className="text-sm text-muted">No sales yet</p>
                        ) : null}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Low stock</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.lowStock.length === 0 ? (
                    <p className="text-sm text-muted">
                      All raw materials are above their reorder level.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {data.lowStock.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <IconAlert className="h-4 w-4 shrink-0 text-brand-gold" />
                            <span className="truncate text-sm font-medium">{item.name}</span>
                          </div>
                          <Badge tone="gold">
                            {formatNumber(item.stock)} {item.unit}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top products</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.topProducts.length === 0 ? (
                    <p className="text-sm text-muted">No sales recorded yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {data.topProducts.map((p, i) => (
                        <li key={p.id} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-brand-soft)] text-[10px] font-bold">
                              {i + 1}
                            </span>
                            <span className="truncate text-sm font-medium">{p.name}</span>
                          </div>
                          <span className="shrink-0 text-sm font-semibold">
                            {formatINR(p.soldAmount, true)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/reports"
              className="rounded-xl border border-brand-purple-2/40 bg-[image:var(--gradient-brand-soft)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:brightness-110"
            >
              Drill down in Reports →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
