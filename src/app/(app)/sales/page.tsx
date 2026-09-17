"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useApi, apiRequest } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import type { Sale } from "@/lib/types";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import { IconPlus, IconEdit, IconTrash, IconSearch, IconTag } from "@/components/icons";
import { SaleFormModal } from "@/app/(app)/sales/sale-form";

export default function SalesPage() {
  const { data, loading, error, refetch } = useApi<Sale[]>("/api/sales");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [deleting, setDeleting] = useState<Sale | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { push } = useToast();

  const sales = useMemo(() => {
    let list = data ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.item.name.toLowerCase().includes(q) ||
          s.customer.name.toLowerCase().includes(q) ||
          (s.invoiceNumber ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search]);

  const total = sales.reduce((sum, s) => sum + s.amount, 0);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await apiRequest(`/api/sales/${deleting.id}`, { method: "DELETE" });
      push("Sale deleted");
      setDeleting(null);
      refetch();
    } catch (err) {
      push(err instanceof Error ? err.message : "Could not delete sale", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Sales"
        description="Sales of finished bracelets & accessories to customers."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <IconPlus className="h-4 w-4" /> Record sale
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search product, customer, invoice…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {sales.length > 0 ? (
          <p className="text-sm text-muted">
            {sales.length} entries · Total{" "}
            <span className="font-semibold text-foreground">{formatINR(total)}</span>
          </p>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted">Loading sales…</div>
        ) : error ? (
          <div className="p-6 text-sm text-danger">{error}</div>
        ) : sales.length === 0 ? (
          <EmptyState
            icon={<IconTag className="h-6 w-6 text-brand-pink-2" />}
            title="No sales recorded"
            description="Record your first sale of a finished product — date, customer and amount in INR."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <IconPlus className="h-4 w-4" /> Record sale
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium text-right">Qty</th>
                  <th className="px-5 py-3 font-medium text-right">Rate</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted">
                      {formatDate(s.date)}
                    </td>
                    <td className="px-5 py-3.5 font-medium">{s.item.name}</td>
                    <td className="px-5 py-3.5">{s.customer.name}</td>
                    <td className="px-5 py-3.5 text-right">
                      {formatNumber(s.quantity)} {s.item.unit}
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted">
                      {formatINR(s.rate)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold">
                      {formatINR(s.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      {s.paymentMode ? (
                        <Badge tone="teal">{s.paymentMode}</Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditing(s);
                            setFormOpen(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/10 hover:text-foreground cursor-pointer"
                          aria-label="Edit"
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(s)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger cursor-pointer"
                          aria-label="Delete"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <SaleFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={refetch}
        sale={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete sale entry?"
        description={`This will permanently remove the ${deleting?.item.name} sale to ${deleting?.customer.name}.`}
        loading={deleteLoading}
      />
    </div>
  );
}
