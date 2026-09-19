"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { QuickActionTile, ManageTile } from "@/components/dashboard/tiles";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { CategoryTrendChart } from "@/components/dashboard/category-trend-chart";
import { InsightTile } from "@/components/dashboard/insight-tile";
import { useApi } from "@/lib/use-api";
import type { Category, DashboardData, ProductName } from "@/lib/types";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import { DATE_PRESETS, datePresetRange } from "@/lib/date-presets";
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
  IconCalendar,
  IconClose,
  IconTrophy,
  IconCoupon,
  IconBox,
  IconTrendDown,
} from "@/components/icons";

// Client-only: its initial open/closed state depends on localStorage, so it
// must never be part of the server-rendered HTML (there'd be nothing to
// hydrate that state against).
const NainuGuide = dynamic(
  () => import("@/components/nainu/nainu-guide").then((m) => m.NainuGuide),
  { ssr: false }
);

export default function DashboardPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productName, setProductName] = useState("");

  const { data: categories } = useApi<Category[]>("/api/categories");
  const { data: productNames } = useApi<ProductName[]>("/api/product-names");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (categoryId) params.set("categoryId", categoryId);
    if (productName) params.set("productName", productName);
    const qs = params.toString();
    return `/api/dashboard${qs ? `?${qs}` : ""}`;
  }, [from, to, categoryId, productName]);

  const { data, loading, error } = useApi<DashboardData>(query);

  const activePreset = DATE_PRESETS.find((p) => {
    const r = datePresetRange(p.key);
    return r.from === from && r.to === to;
  })?.key;
  const categoryName = categories?.find((c) => c.id === categoryId)?.name;
  const hasFilters = Boolean(from || to || categoryId || productName);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Hi Five by Jia — purchase & sale overview, all figures in INR."
        back={false}
      />

      <Card className="mb-6 overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple-2">
              <IconFilter className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Filters</CardTitle>
              <p className="text-xs text-muted">Narrow the whole dashboard by date range, category or product</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  const r = datePresetRange(p.key);
                  setFrom(r.from);
                  setTo(r.to);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activePreset === p.key
                    ? "bg-[image:var(--gradient-brand)] text-white shadow-[0_4px_16px_rgba(236,24,118,0.3)]"
                    : "border border-border bg-surface-2 text-muted hover:text-foreground hover:border-brand-purple-2/50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
            <Field label="From" className="w-full sm:w-44">
              <div className="relative">
                <IconCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="pl-9" />
              </div>
            </Field>
            <Field label="To" className="w-full sm:w-44">
              <div className="relative">
                <IconCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="pl-9" />
              </div>
            </Field>
            <Field label="Category" className="w-full sm:w-48">
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">All categories</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Product" className="w-full sm:w-48">
              <Select value={productName} onChange={(e) => setProductName(e.target.value)}>
                <option value="">All products</option>
                {productNames?.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            {hasFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFrom("");
                  setTo("");
                  setCategoryId("");
                  setProductName("");
                }}
              >
                <IconClose className="h-4 w-4" /> Clear all
              </Button>
            ) : null}
          </div>

          {hasFilters ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              {from ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">
                  From {formatDate(`${from}T00:00:00`)}
                  <button onClick={() => setFrom("")} className="text-muted hover:text-foreground cursor-pointer" aria-label="Remove from date">
                    <IconClose className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
              {to ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">
                  To {formatDate(`${to}T00:00:00`)}
                  <button onClick={() => setTo("")} className="text-muted hover:text-foreground cursor-pointer" aria-label="Remove to date">
                    <IconClose className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
              {categoryName ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">
                  Category: {categoryName}
                  <button onClick={() => setCategoryId("")} className="text-muted hover:text-foreground cursor-pointer" aria-label="Remove category filter">
                    <IconClose className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
              {productName ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted">
                  Product: {productName}
                  <button onClick={() => setProductName("")} className="text-muted hover:text-foreground cursor-pointer" aria-label="Remove product filter">
                    <IconClose className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Total Purchases"
              value={formatINR(data.totals.purchases)}
              icon={<IconCartDown className="h-5 w-5" />}
              accent="purple"
              sub={`This month: ${formatINR(data.month.purchases)}`}
              details={{
                title: "Recent purchases",
                emptyText: "No purchases recorded yet.",
                rows: data.recentPurchases.slice(0, 5).map((p) => ({
                  label: p.item.name,
                  sub: p.vendor.name,
                  value: formatINR(p.amount),
                })),
              }}
            />
            <StatCard
              label="Total Sales"
              value={formatINR(data.totals.sales)}
              icon={<IconRupee className="h-5 w-5" />}
              accent="pink"
              sub={`This month: ${formatINR(data.month.sales)}`}
              details={{
                title: "Recent sales",
                emptyText: "No sales recorded yet.",
                rows: data.recentSales.slice(0, 5).map((s) => ({
                  label: s.item.name,
                  sub: s.customer.name,
                  value: formatINR(s.amount),
                })),
              }}
            />
            <StatCard
              label="Total Expenses"
              value={formatINR(data.totals.expenses)}
              icon={<IconWallet className="h-5 w-5" />}
              accent="gold"
              sub={`This month: ${formatINR(data.month.expenses)}`}
              details={{
                title: "Recent expenses",
                emptyText: "No expenses recorded yet.",
                rows: data.recentExpenses.slice(0, 5).map((e) => ({
                  label: e.description,
                  sub: e.category,
                  value: formatINR(e.amount),
                })),
              }}
            />
            <StatCard
              label="Net Profit"
              value={formatINR(data.totals.profit)}
              icon={<IconTrendUp className="h-5 w-5" />}
              accent="teal"
              trend={
                data.totals.profit >= 0
                  ? { direction: "up", label: "Sales ahead of costs" }
                  : { direction: "down", label: "Costs ahead of sales" }
              }
              details={{
                title: "How this is calculated",
                emptyText: "",
                rows: [
                  { label: "Sales", value: formatINR(data.totals.sales) },
                  { label: "Purchases", value: `-${formatINR(data.totals.purchases)}` },
                  { label: "Expenses", value: `-${formatINR(data.totals.expenses)}` },
                ],
              }}
            />
            <StatCard
              label="Outstanding Dues"
              value={formatINR(data.totals.due)}
              icon={<IconWallet className="h-5 w-5" />}
              accent="gold"
              sub={data.totals.due > 0 ? "Owed by customers" : "Everyone's paid up"}
              details={{
                title: "Customers with dues",
                emptyText: "Everyone's paid up.",
                rows: data.topDues.map((d) => ({
                  label: d.name,
                  sub: `${d.entries} entr${d.entries === 1 ? "y" : "ies"}`,
                  value: formatINR(d.due),
                })),
              }}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Purchases vs Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart data={data.trend} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sales by category</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryChart data={data.categoryBreakdown} />
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center gap-2">
              <IconSparkle className="h-4 w-4 text-brand-gold" />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Last 3 Months — What&apos;s Trending
              </p>
            </div>
            <Card className="mb-4 overflow-hidden">
              <CardHeader>
                <CardTitle>Monthly sales by category</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryTrendChart
                  data={data.threeMonthTrends.monthly}
                  categories={data.threeMonthTrends.categories}
                />
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <InsightTile
                icon={<IconTrophy className="h-5 w-5" />}
                label="Best Seller"
                title={data.threeMonthTrends.bestSellerByQty?.name ?? "No sales yet"}
                value={
                  data.threeMonthTrends.bestSellerByQty
                    ? `${formatNumber(data.threeMonthTrends.bestSellerByQty.qty)} ${data.threeMonthTrends.bestSellerByQty.unit} sold`
                    : undefined
                }
                sub="Highest quantity sold"
                accent="gold"
              />
              <InsightTile
                icon={<IconRupee className="h-5 w-5" />}
                label="Top Revenue"
                title={data.threeMonthTrends.topRevenueProduct?.name ?? "No sales yet"}
                value={
                  data.threeMonthTrends.topRevenueProduct
                    ? formatINR(data.threeMonthTrends.topRevenueProduct.amount)
                    : undefined
                }
                sub="Highest sales value"
                accent="pink"
              />
              <InsightTile
                icon={<IconTag className="h-5 w-5" />}
                label="Top Category"
                title={data.threeMonthTrends.topCategory?.name ?? "No sales yet"}
                value={
                  data.threeMonthTrends.topCategory
                    ? formatINR(data.threeMonthTrends.topCategory.amount)
                    : undefined
                }
                sub="Best-selling category"
                accent="purple"
              />
              <InsightTile
                icon={<IconTrendDown className="h-5 w-5" />}
                label="Slowest Mover"
                title={data.threeMonthTrends.slowestMoverByQty?.name ?? "—"}
                value={
                  data.threeMonthTrends.slowestMoverByQty
                    ? `${formatNumber(data.threeMonthTrends.slowestMoverByQty.qty)} ${data.threeMonthTrends.slowestMoverByQty.unit} sold`
                    : undefined
                }
                sub="Lowest quantity sold"
                accent="teal"
              />
              <InsightTile
                icon={<IconAlert className="h-5 w-5" />}
                label="Lowest Revenue"
                title={data.threeMonthTrends.lowestRevenueProduct?.name ?? "—"}
                value={
                  data.threeMonthTrends.lowestRevenueProduct
                    ? formatINR(data.threeMonthTrends.lowestRevenueProduct.amount)
                    : undefined
                }
                sub="Smallest contribution to sales"
                accent="gold"
              />
              <InsightTile
                icon={<IconBox className="h-5 w-5" />}
                label="Dead Stock"
                title={
                  data.threeMonthTrends.deadStock.count === 0
                    ? "Everything's selling!"
                    : `${data.threeMonthTrends.deadStock.count} product${
                        data.threeMonthTrends.deadStock.count === 1 ? "" : "s"
                      }`
                }
                sub={
                  data.threeMonthTrends.deadStock.count === 0
                    ? "No unsold products in 3 months"
                    : `Not sold: ${data.threeMonthTrends.deadStock.items.map((i) => i.name).join(", ")}`
                }
                accent={data.threeMonthTrends.deadStock.count === 0 ? "teal" : "purple"}
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

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <IconTrophy className="h-4 w-4 text-brand-gold" />
                    <CardTitle>Top customers</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {data.topCustomers.length === 0 ? (
                    <p className="text-sm text-muted">No sales recorded yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {data.topCustomers.map((c, i) => (
                        <li key={c.id} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-brand-soft)] text-[10px] font-bold">
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{c.name}</p>
                              <p className="text-xs text-muted">
                                {c.orders} order{c.orders === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-semibold">
                            {formatINR(c.totalSpent, true)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Quick actions
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
              <QuickActionTile
                href="/expenses"
                icon={<IconWallet className="h-5 w-5" />}
                title="Record expense"
                subtitle="Log a business cost"
                tone="gold"
              />
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Manage
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-9">
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
                href="/raw-material-names"
                icon={<IconBox className="h-5 w-5" />}
                label="Raw Material Names"
                tone="teal"
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
                href="/coupons"
                icon={<IconCoupon className="h-5 w-5" />}
                label="Coupons"
                tone="gold"
              />
              <ManageTile
                href="/expenses"
                icon={<IconWallet className="h-5 w-5" />}
                label="Expenses"
                tone="teal"
              />
              <ManageTile
                href="/reports"
                icon={<IconChart className="h-5 w-5" />}
                label="Reports"
                tone="purple"
              />
            </div>
          </div>
        </>
      )}

      <NainuGuide />
    </div>
  );
}
