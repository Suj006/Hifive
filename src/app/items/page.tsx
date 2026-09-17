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
import type { Item, ItemType } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { IconPlus, IconEdit, IconTrash, IconSearch, IconLayers } from "@/components/icons";
import { ItemFormModal } from "@/app/items/item-form";

export default function ItemsPage() {
  const { data, loading, error, refetch } = useApi<Item[]>("/api/items");
  const [tab, setTab] = useState<ItemType | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { push } = useToast();

  const items = useMemo(() => {
    let list = data ?? [];
    if (tab !== "ALL") list = list.filter((i) => i.type === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q) ||
          (i.group ?? "").toLowerCase().includes(q) ||
          (i.category?.name ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, tab, search]);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await apiRequest(`/api/items/${deleting.id}`, { method: "DELETE" });
      push("Item deleted");
      setDeleting(null);
      refetch();
    } catch (err) {
      push(err instanceof Error ? err.message : "Could not delete item", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Item Master"
        description="Raw materials and finished products used across purchases & sales."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <IconPlus className="h-4 w-4" /> Add item
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit gap-1 rounded-xl border border-border bg-surface-2 p-1">
          {(
            [
              ["ALL", "All"],
              ["RAW_MATERIAL", "Raw materials"],
              ["PRODUCT", "Products"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                tab === value
                  ? "bg-[image:var(--gradient-brand)] text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted">Loading items…</div>
        ) : error ? (
          <div className="p-6 text-sm text-danger">{error}</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<IconLayers className="h-6 w-6 text-brand-purple-2" />}
            title="No items yet"
            description="Add raw materials (beads, thread, charms…) and finished products (bracelets, keychains…) to start recording purchases and sales."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <IconPlus className="h-4 w-4" /> Add item
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium text-right">Stock</th>
                  <th className="px-5 py-3 font-medium text-right">Entries</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-muted">
                      {item.code}
                    </td>
                    <td className="px-5 py-3.5 font-medium">
                      {item.name}
                      {item.group ? (
                        <span className="ml-1.5 text-xs font-normal text-muted">
                          ({item.group})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={item.type === "RAW_MATERIAL" ? "teal" : "pink"}>
                        {item.type === "RAW_MATERIAL" ? "Raw material" : "Product"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      {item.category ? (
                        <Badge tone="gold">{item.category.name}</Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={
                          item.reorderLevel > 0 &&
                          (item.stock ?? 0) <= item.reorderLevel
                            ? "font-semibold text-danger"
                            : "font-medium"
                        }
                      >
                        {formatNumber(item.stock ?? 0)} {item.unit}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted">
                      {item.type === "RAW_MATERIAL"
                        ? item._count?.purchases ?? 0
                        : item._count?.sales ?? 0}
                    </td>
                    <td className="px-5 py-3.5">
                      {item.isActive ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="neutral">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditing(item);
                            setFormOpen(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/10 hover:text-foreground cursor-pointer"
                          aria-label="Edit"
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(item)}
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

      <ItemFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={refetch}
        item={editing}
        defaultType={tab === "PRODUCT" ? "PRODUCT" : "RAW_MATERIAL"}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete item?"
        description={`This will permanently remove "${deleting?.name}" from the item master.`}
        loading={deleteLoading}
      />
    </div>
  );
}
