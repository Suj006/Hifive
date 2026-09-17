"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useApi } from "@/lib/use-api";
import type { Category, ReportsData } from "@/lib/types";
import { formatDate, formatINR, formatNumber, toDateInputValue, todayInputValue } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { exportNodeAsPng } from "@/lib/export-png";
import {
  IconCartDown,
  IconRupee,
  IconTag,
  IconChart,
  IconLayers,
  IconSparkle,
  IconTruck,
  IconUsers,
  IconFilter,
  IconDownload,
  IconImage,
  IconCalendar,
  IconClose,
} from "@/components/icons";

type Tone = "pink" | "purple" | "teal" | "gold";

const TONE_CHIP: Record<Tone, string> = {
  pink: "bg-brand-pink/15 text-brand-pink-2",
  purple: "bg-brand-purple/15 text-brand-purple-2",
  teal: "bg-brand-teal/15 text-brand-teal",
  gold: "bg-brand-gold/15 text-brand-gold",
};

const TONE_GLOW: Record<Tone, string> = {
  pink: "from-brand-pink/20 to-transparent",
  purple: "from-brand-purple/20 to-transparent",
  teal: "from-brand-teal/20 to-transparent",
  gold: "from-brand-gold/20 to-transparent",
};

type PendingExport = { title: string; filename: string; getNode: () => HTMLElement | null };

function ReportTable<T extends Record<string, unknown>>({
  title,
  icon,
  tone,
  rows,
  columns,
  csvName,
  pngName,
  countLabel = "entries",
  emptyText,
  minWidth = 520,
  onExportPngRequest,
}: {
  title: string;
  icon: ReactNode;
  tone: Tone;
  rows: T[];
  columns: { key: keyof T; label: string; align?: "right"; format?: (v: unknown) => string }[];
  csvName: string;
  pngName: string;
  countLabel?: string;
  emptyText: string;
  minWidth?: number;
  onExportPngRequest: (getNode: () => HTMLElement | null, title: string, filename: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={cardRef}>
      <Card className="relative overflow-hidden">
        <div
          className={`pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-gradient-to-br blur-3xl ${TONE_GLOW[tone]}`}
        />
        <CardHeader className="relative flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE_CHIP[tone]}`}>
              {icon}
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <p className="text-xs text-muted">
                {rows.length} {countLabel}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={rows.length === 0}
              onClick={() =>
                downloadCsv(
                  csvName,
                  rows.map((row) =>
                    Object.fromEntries(
                      columns.map((c) => [
                        c.label,
                        c.format ? c.format(row[c.key]) : String(row[c.key]),
                      ])
                    )
                  )
                )
              }
            >
              <IconDownload className="h-4 w-4" /> CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={rows.length === 0}
              onClick={() => onExportPngRequest(() => cardRef.current, title, pngName)}
            >
              <IconImage className="h-4 w-4" /> PNG
            </Button>
          </div>
        </CardHeader>
        <CardContent className="relative p-0">
          {rows.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted">{emptyText}</p>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm" style={{ minWidth }}>
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    {columns.map((c) => (
                      <th
                        key={String(c.key)}
                        className={`px-5 py-3 font-medium ${c.align === "right" ? "text-right" : ""}`}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]"
                    >
                      {columns.map((c) => (
                        <td
                          key={String(c.key)}
                          className={`px-5 py-3.5 ${c.align === "right" ? "text-right" : ""}`}
                        >
                          {c.format ? c.format(row[c.key]) : String(row[c.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}

const PRESETS = [
  { key: "all", label: "All time" },
  { key: "month", label: "This month" },
  { key: "lastMonth", label: "Last month" },
  { key: "year", label: "This year" },
] as const;

function presetRange(key: (typeof PRESETS)[number]["key"]): { from: string; to: string } {
  const now = new Date();
  if (key === "month") return { from: toDateInputValue(startOfMonth(now)), to: todayInputValue() };
  if (key === "lastMonth") {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { from: toDateInputValue(startOfMonth(lastMonth)), to: toDateInputValue(endOfMonth(lastMonth)) };
  }
  if (key === "year") return { from: toDateInputValue(startOfYear(now)), to: todayInputValue() };
  return { from: "", to: "" };
}

export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const { push } = useToast();
  const reportBodyRef = useRef<HTMLDivElement>(null);
  const [pendingExport, setPendingExport] = useState<PendingExport | null>(null);
  const [exporting, setExporting] = useState(false);

  const { data: categories } = useApi<Category[]>("/api/categories");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (categoryId) params.set("categoryId", categoryId);
    const qs = params.toString();
    return `/api/reports${qs ? `?${qs}` : ""}`;
  }, [from, to, categoryId]);

  const { data, loading, error } = useApi<ReportsData>(query);

  const activePreset = PRESETS.find((p) => {
    const r = presetRange(p.key);
    return r.from === from && r.to === to;
  })?.key;

  const categoryName = categories?.find((c) => c.id === categoryId)?.name;
  const hasFilters = Boolean(from || to || categoryId);

  function requestExportPng(getNode: () => HTMLElement | null, title: string, filename: string) {
    setPendingExport({ getNode, title, filename });
  }

  async function handleConfirmExport() {
    if (!pendingExport) return;
    const node = pendingExport.getNode();
    if (!node) {
      push("Could not find that report on screen", "error");
      setPendingExport(null);
      return;
    }
    setExporting(true);
    try {
      await exportNodeAsPng(node, pendingExport.filename);
      push("Image downloaded");
      setPendingExport(null);
    } catch {
      push("Could not export image — please try again", "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Drill down into purchases, sales & production — item-wise, category-wise, vendor-wise and customer-wise."
        action={
          <Button
            variant="secondary"
            disabled={!data}
            onClick={() =>
              requestExportPng(() => reportBodyRef.current, "Hi Five by Jia — Reports", "hifive-reports.png")
            }
          >
            <IconImage className="h-4 w-4" /> Export full report
          </Button>
        }
      />

      <Card className="mb-6 overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple-2">
              <IconFilter className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Filters</CardTitle>
              <p className="text-xs text-muted">Narrow the report by date range or product category</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  const r = presetRange(p.key);
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
            <Field label="From" className="w-full sm:w-48">
              <div className="relative">
                <IconCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="pl-9" />
              </div>
            </Field>
            <Field label="To" className="w-full sm:w-48">
              <div className="relative">
                <IconCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="pl-9" />
              </div>
            </Field>
            <Field label="Category" className="w-full sm:w-56">
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">All categories</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
              className="h-28 animate-pulse rounded-2xl border border-border bg-surface-2/50"
            />
          ))}
        </div>
      ) : (
        <div ref={reportBodyRef}>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Purchases"
              value={formatINR(data.totals.purchaseAmount)}
              icon={<IconCartDown className="h-5 w-5" />}
              accent="purple"
              sub={`${formatNumber(data.totals.purchaseQty)} units`}
            />
            <StatCard
              label="Sales"
              value={formatINR(data.totals.saleAmount)}
              icon={<IconRupee className="h-5 w-5" />}
              accent="pink"
              sub={`${formatNumber(data.totals.saleQty)} units`}
            />
            <StatCard
              label="Net"
              value={formatINR(data.totals.saleAmount - data.totals.purchaseAmount)}
              icon={<IconChart className="h-5 w-5" />}
              accent="teal"
            />
            <StatCard
              label="Categories sold"
              value={String(data.categoryWise.length)}
              icon={<IconTag className="h-5 w-5" />}
              accent="gold"
            />
          </div>

          <div className="flex flex-col gap-6">
            <ReportTable
              title="Product inventory — made, sold & remaining (as of now)"
              icon={<IconLayers className="h-5 w-5" />}
              tone="teal"
              rows={data.productInventory}
              csvName="product-inventory.csv"
              pngName="product-inventory.png"
              countLabel="products"
              emptyText="No products in the item master yet."
              minWidth={640}
              onExportPngRequest={requestExportPng}
              columns={[
                { key: "code", label: "Code" },
                { key: "name", label: "Product" },
                { key: "category", label: "Category" },
                { key: "made", label: "Made", align: "right", format: (v) => formatNumber(v as number) },
                { key: "sold", label: "Sold", align: "right", format: (v) => formatNumber(v as number) },
                { key: "remaining", label: "Remaining", align: "right", format: (v) => formatNumber(v as number) },
              ]}
            />

            <ReportTable
              title="Item-wise purchases (raw materials)"
              icon={<IconCartDown className="h-5 w-5" />}
              tone="purple"
              rows={data.itemWisePurchases}
              csvName="item-wise-purchases.csv"
              pngName="item-wise-purchases.png"
              countLabel="items"
              emptyText="No purchases in this range."
              onExportPngRequest={requestExportPng}
              columns={[
                { key: "code", label: "Code" },
                { key: "name", label: "Item" },
                { key: "qty", label: "Qty purchased", align: "right", format: (v) => `${formatNumber(v as number)}` },
                { key: "amount", label: "Amount", align: "right", format: (v) => formatINR(v as number) },
              ]}
            />

            <ReportTable
              title="Item-wise production (items made)"
              icon={<IconSparkle className="h-5 w-5" />}
              tone="teal"
              rows={data.itemWiseProduction}
              csvName="item-wise-production.csv"
              pngName="item-wise-production.png"
              countLabel="items"
              emptyText="No production entries in this range."
              minWidth={560}
              onExportPngRequest={requestExportPng}
              columns={[
                { key: "code", label: "Code" },
                { key: "name", label: "Product" },
                { key: "category", label: "Category" },
                { key: "qty", label: "Qty made", align: "right", format: (v) => `${formatNumber(v as number)}` },
              ]}
            />

            <ReportTable
              title="Item & category-wise sales (products)"
              icon={<IconTag className="h-5 w-5" />}
              tone="pink"
              rows={data.itemWiseSales}
              csvName="item-wise-sales.csv"
              pngName="item-wise-sales.png"
              countLabel="products"
              emptyText="No sales in this range."
              onExportPngRequest={requestExportPng}
              columns={[
                { key: "code", label: "Code" },
                { key: "name", label: "Product" },
                { key: "category", label: "Category" },
                { key: "qty", label: "Qty sold", align: "right", format: (v) => `${formatNumber(v as number)}` },
                { key: "amount", label: "Amount", align: "right", format: (v) => formatINR(v as number) },
              ]}
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ReportTable
                title="Vendor-wise purchases"
                icon={<IconTruck className="h-5 w-5" />}
                tone="gold"
                rows={data.vendorWise}
                csvName="vendor-wise-purchases.csv"
                pngName="vendor-wise-purchases.png"
                countLabel="vendors"
                emptyText="No purchases in this range."
                minWidth={360}
                onExportPngRequest={requestExportPng}
                columns={[
                  { key: "name", label: "Vendor" },
                  { key: "entries", label: "Entries", align: "right" },
                  { key: "amount", label: "Amount", align: "right", format: (v) => formatINR(v as number) },
                ]}
              />
              <ReportTable
                title="Customer-wise sales"
                icon={<IconUsers className="h-5 w-5" />}
                tone="pink"
                rows={data.customerWise}
                csvName="customer-wise-sales.csv"
                pngName="customer-wise-sales.png"
                countLabel="customers"
                emptyText="No sales in this range."
                minWidth={360}
                onExportPngRequest={requestExportPng}
                columns={[
                  { key: "name", label: "Customer" },
                  { key: "entries", label: "Entries", align: "right" },
                  { key: "amount", label: "Amount", align: "right", format: (v) => formatINR(v as number) },
                ]}
              />
            </div>

            <ReportTable
              title="Category-wise sales"
              icon={<IconFilter className="h-5 w-5" />}
              tone="gold"
              rows={data.categoryWise}
              csvName="category-wise-sales.csv"
              pngName="category-wise-sales.png"
              countLabel="categories"
              emptyText="No sales in this range."
              onExportPngRequest={requestExportPng}
              columns={[
                { key: "category", label: "Category" },
                { key: "qty", label: "Qty sold", align: "right", format: (v) => `${formatNumber(v as number)}` },
                { key: "amount", label: "Amount", align: "right", format: (v) => formatINR(v as number) },
              ]}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingExport}
        onClose={() => (exporting ? null : setPendingExport(null))}
        onConfirm={handleConfirmExport}
        title="Export as image?"
        description={
          pendingExport
            ? `This creates a PNG snapshot of "${pendingExport.title}" that you can save or share. Continue?`
            : undefined
        }
        confirmLabel="Export PNG"
        confirmVariant="primary"
        loading={exporting}
      />
    </div>
  );
}
