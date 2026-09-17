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
import type { Production } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/format";
import { IconPlus, IconEdit, IconTrash, IconSearch, IconSparkle } from "@/components/icons";
import { ProductionFormModal } from "@/app/(app)/production/production-form";

export default function ProductionPage() {
  const { data, loading, error, refetch } = useApi<Production[]>("/api/production");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Production | null>(null);
  const [deleting, setDeleting] = useState<Production | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { push } = useToast();

  const entries = useMemo(() => {
    let list = data ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.item.name.toLowerCase().includes(q) ||
          (p.item.category?.name ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search]);

  const totalQty = entries.reduce((sum, p) => sum + p.quantity, 0);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await apiRequest(`/api/production/${deleting.id}`, { method: "DELETE" });
      push("Production entry deleted");
      setDeleting(null);
      refetch();
    } catch (err) {
      push(err instanceof Error ? err.message : "Could not delete production entry", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Production"
        description="Log the finished products you make — each entry adds to that product's available stock for sale."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <IconPlus className="h-4 w-4" /> Record items made
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search product, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {entries.length > 0 ? (
          <p className="text-sm text-muted">
            {entries.length} entries · Total made{" "}
            <span className="font-semibold text-foreground">{formatNumber(totalQty)}</span>
          </p>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted">Loading production entries…</div>
        ) : error ? (
          <div className="p-6 text-sm text-danger">{error}</div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<IconSparkle className="h-6 w-6 text-brand-purple-2" />}
            title="No production recorded"
            description="Log a batch of finished products you've made — it adds straight to that product's stock, ready for Sales."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <IconPlus className="h-4 w-4" /> Record items made
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium text-right">Qty made</th>
                  <th className="px-5 py-3 font-medium">Notes</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted">
                      {formatDate(p.date)}
                    </td>
                    <td className="px-5 py-3.5 font-medium">{p.item.name}</td>
                    <td className="px-5 py-3.5">
                      {p.item.category ? (
                        <Badge tone="gold">{p.item.category.name}</Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold">
                      {formatNumber(p.quantity)} {p.item.unit}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{p.notes || "—"}</td>
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

      <ProductionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={refetch}
        production={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete production entry?"
        description={`This will remove ${deleting?.quantity} ${deleting?.item.unit} of "${deleting?.item.name}" from stock records.`}
        loading={deleteLoading}
      />
    </div>
  );
}
