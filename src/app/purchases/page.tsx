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
import type { Purchase } from "@/lib/types";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import { IconPlus, IconEdit, IconTrash, IconSearch, IconCartDown } from "@/components/icons";
import { PurchaseFormModal } from "@/app/purchases/purchase-form";

export default function PurchasesPage() {
  const { data, loading, error, refetch } = useApi<Purchase[]>("/api/purchases");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [deleting, setDeleting] = useState<Purchase | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { push } = useToast();

  const purchases = useMemo(() => {
    let list = data ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.item.name.toLowerCase().includes(q) ||
          p.vendor.name.toLowerCase().includes(q) ||
          (p.invoiceNumber ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search]);

  const total = purchases.reduce((sum, p) => sum + p.amount, 0);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await apiRequest(`/api/purchases/${deleting.id}`, { method: "DELETE" });
      push("Purchase deleted");
      setDeleting(null);
      refetch();
    } catch (err) {
      push(err instanceof Error ? err.message : "Could not delete purchase", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Purchases"
        description="Raw material purchases recorded against the item master."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <IconPlus className="h-4 w-4" /> Record purchase
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search item, vendor, invoice…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {purchases.length > 0 ? (
          <p className="text-sm text-muted">
            {purchases.length} entries · Total{" "}
            <span className="font-semibold text-foreground">{formatINR(total)}</span>
          </p>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted">Loading purchases…</div>
        ) : error ? (
          <div className="p-6 text-sm text-danger">{error}</div>
        ) : purchases.length === 0 ? (
          <EmptyState
            icon={<IconCartDown className="h-6 w-6 text-brand-purple-2" />}
            title="No purchases recorded"
            description="Record your first raw material purchase — date, vendor and amount in INR."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <IconPlus className="h-4 w-4" /> Record purchase
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Item</th>
                  <th className="px-5 py-3 font-medium">Vendor</th>
                  <th className="px-5 py-3 font-medium text-right">Qty</th>
                  <th className="px-5 py-3 font-medium text-right">Rate</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted">
                      {formatDate(p.date)}
                    </td>
                    <td className="px-5 py-3.5 font-medium">{p.item.name}</td>
                    <td className="px-5 py-3.5">{p.vendor.name}</td>
                    <td className="px-5 py-3.5 text-right">
                      {formatNumber(p.quantity)} {p.item.unit}
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted">
                      {formatINR(p.rate)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold">
                      {formatINR(p.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      {p.paymentMode ? (
                        <Badge tone="purple">{p.paymentMode}</Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditing(p);
                            setFormOpen(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/10 hover:text-foreground cursor-pointer"
                          aria-label="Edit"
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(p)}
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

      <PurchaseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={refetch}
        purchase={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete purchase entry?"
        description={`This will permanently remove the ${deleting?.item.name} purchase from ${deleting?.vendor.name}.`}
        loading={deleteLoading}
      />
    </div>
  );
}
