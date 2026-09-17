"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { useApi } from "@/lib/use-api";
import type { ReportsData } from "@/lib/types";
import { formatINR, formatNumber } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { IconCartDown, IconRupee, IconTag, IconChart } from "@/components/icons";

function ReportTable<T extends Record<string, unknown>>({
  title,
  rows,
  columns,
  csvName,
  emptyText,
  minWidth = 520,
}: {
  title: string;
  rows: T[];
  columns: { key: keyof T; label: string; align?: "right"; format?: (v: unknown) => string }[];
  csvName: string;
  emptyText: string;
  minWidth?: number;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
          Export CSV
        </Button>
      </CardHeader>
      <CardContent className="p-0">
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
  );
}

export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return `/api/reports${qs ? `?${qs}` : ""}`;
  }, [from, to]);

  const { data, loading, error } = useApi<ReportsData>(query);

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Drill down into purchases and sales — item-wise, category-wise, vendor-wise and customer-wise."
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-end">
          <Field label="From" className="w-full sm:w-48">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To" className="w-full sm:w-48">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          {(from || to) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
            >
              Clear filter
            </Button>
          )}
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
        <>
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
              rows={data.productInventory}
              csvName="product-inventory.csv"
              emptyText="No products in the item master yet."
              minWidth={640}
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
              rows={data.itemWisePurchases}
              csvName="item-wise-purchases.csv"
              emptyText="No purchases in this range."
              columns={[
                { key: "code", label: "Code" },
                { key: "name", label: "Item" },
                { key: "qty", label: "Qty purchased", align: "right", format: (v) => `${formatNumber(v as number)}` },
                { key: "amount", label: "Amount", align: "right", format: (v) => formatINR(v as number) },
              ]}
            />

            <ReportTable
              title="Item-wise production (items made)"
              rows={data.itemWiseProduction}
              csvName="item-wise-production.csv"
              emptyText="No production entries in this range."
              minWidth={560}
              columns={[
                { key: "code", label: "Code" },
                { key: "name", label: "Product" },
                { key: "category", label: "Category" },
                { key: "qty", label: "Qty made", align: "right", format: (v) => `${formatNumber(v as number)}` },
              ]}
            />

            <ReportTable
              title="Item & category-wise sales (products)"
              rows={data.itemWiseSales}
              csvName="item-wise-sales.csv"
              emptyText="No sales in this range."
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
                rows={data.vendorWise}
                csvName="vendor-wise-purchases.csv"
                emptyText="No purchases in this range."
                minWidth={360}
                columns={[
                  { key: "name", label: "Vendor" },
                  { key: "entries", label: "Entries", align: "right" },
                  { key: "amount", label: "Amount", align: "right", format: (v) => formatINR(v as number) },
                ]}
              />
              <ReportTable
                title="Customer-wise sales"
                rows={data.customerWise}
                csvName="customer-wise-sales.csv"
                emptyText="No sales in this range."
                minWidth={360}
                columns={[
                  { key: "name", label: "Customer" },
                  { key: "entries", label: "Entries", align: "right" },
                  { key: "amount", label: "Amount", align: "right", format: (v) => formatINR(v as number) },
                ]}
              />
            </div>

            <ReportTable
              title="Category-wise sales"
              rows={data.categoryWise}
              csvName="category-wise-sales.csv"
              emptyText="No sales in this range."
              columns={[
                { key: "category", label: "Category" },
                { key: "qty", label: "Qty sold", align: "right", format: (v) => `${formatNumber(v as number)}` },
                { key: "amount", label: "Amount", align: "right", format: (v) => formatINR(v as number) },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
