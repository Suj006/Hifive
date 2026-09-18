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
import { useRole } from "@/lib/use-role";
import type { Expense } from "@/lib/types";
import { formatDate, formatINR } from "@/lib/format";
import { IconPlus, IconEdit, IconTrash, IconSearch, IconWallet } from "@/components/icons";
import { ExpenseFormModal } from "@/app/(app)/expenses/expense-form";

export default function ExpensesPage() {
  const { data, loading, error, refetch } = useApi<Expense[]>("/api/expenses");
  const { isAdmin } = useRole();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { push } = useToast();

  const expenses = useMemo(() => {
    let list = data ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await apiRequest(`/api/expenses/${deleting.id}`, { method: "DELETE" });
      push("Expense deleted");
      setDeleting(null);
      refetch();
    } catch (err) {
      push(err instanceof Error ? err.message : "Could not delete expense", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Packaging, shipping, rent and every other cost that isn't a raw material purchase."
        action={
          isAdmin ? (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <IconPlus className="h-4 w-4" /> Record expense
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search category, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {expenses.length > 0 ? (
          <p className="text-sm text-muted">
            {expenses.length} entries · Total{" "}
            <span className="font-semibold text-foreground">{formatINR(total)}</span>
          </p>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted">Loading expenses…</div>
        ) : error ? (
          <div className="p-6 text-sm text-danger">{error}</div>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={<IconWallet className="h-6 w-6 text-brand-purple-2" />}
            title="No expenses recorded"
            description="Record your first business expense — packaging, shipping, rent, whatever it costs to run the shop."
            action={
              isAdmin ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  <IconPlus className="h-4 w-4" /> Record expense
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  {isAdmin ? (
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted">
                      {formatDate(e.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone="gold">{e.category}</Badge>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{e.description}</td>
                    <td className="px-5 py-3.5 text-right font-semibold">
                      {formatINR(e.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      {e.paymentMode ? (
                        <Badge tone="purple">{e.paymentMode}</Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    {isAdmin ? (
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditing(e);
                              setFormOpen(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/10 hover:text-foreground cursor-pointer"
                            aria-label="Edit"
                          >
                            <IconEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleting(e)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger cursor-pointer"
                            aria-label="Delete"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {isAdmin ? (
        <>
          <ExpenseFormModal
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSaved={refetch}
            expense={editing}
          />

          <ConfirmDialog
            open={!!deleting}
            onClose={() => setDeleting(null)}
            onConfirm={handleDelete}
            title="Delete expense entry?"
            description={`This will permanently remove "${deleting?.description}".`}
            loading={deleteLoading}
          />
        </>
      ) : null}
    </div>
  );
}
