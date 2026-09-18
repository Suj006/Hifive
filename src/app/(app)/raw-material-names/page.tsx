"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useApi, apiRequest } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import { useRole } from "@/lib/use-role";
import type { RawMaterialName } from "@/lib/types";
import { IconPlus, IconEdit, IconTrash, IconBox } from "@/components/icons";
import { RawMaterialNameFormModal } from "@/app/(app)/raw-material-names/raw-material-name-form";

export default function RawMaterialNamesPage() {
  const { data, loading, error, refetch } = useApi<RawMaterialName[]>("/api/raw-material-names");
  const { isAdmin } = useRole();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RawMaterialName | null>(null);
  const [deleting, setDeleting] = useState<RawMaterialName | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { push } = useToast();
  const rawMaterialNames = data ?? [];

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await apiRequest(`/api/raw-material-names/${deleting.id}`, { method: "DELETE" });
      push("Raw material name deleted");
      setDeleting(null);
      refetch();
    } catch (err) {
      push(err instanceof Error ? err.message : "Could not delete raw material name", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Raw Material Names"
        description="Master list of raw materials you buy — e.g. Silk Thread — Pink, Metal Charm — Heart. Selected when adding a raw material to Item Master."
        action={
          isAdmin ? (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <IconPlus className="h-4 w-4" /> Add raw material name
            </Button>
          ) : undefined
        }
      />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted">Loading…</div>
        ) : error ? (
          <div className="p-6 text-sm text-danger">{error}</div>
        ) : rawMaterialNames.length === 0 ? (
          <EmptyState
            icon={<IconBox className="h-6 w-6 text-brand-purple-2" />}
            title="No raw material names yet"
            description="Add the raw materials you buy — Silk Thread, Metal Charm, Clasp — then use them in Item Master."
            action={
              isAdmin ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  <IconPlus className="h-4 w-4" /> Add raw material name
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium text-right">Items using it</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  {isAdmin ? (
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {rawMaterialNames.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 font-medium">{p.name}</td>
                    <td className="px-5 py-3.5 text-right text-muted">
                      {p._count?.items ?? 0}
                    </td>
                    <td className="px-5 py-3.5">
                      {p.isActive ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="neutral">Inactive</Badge>
                      )}
                    </td>
                    {isAdmin ? (
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
          <RawMaterialNameFormModal
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSaved={refetch}
            rawMaterialName={editing}
          />

          <ConfirmDialog
            open={!!deleting}
            onClose={() => setDeleting(null)}
            onConfirm={handleDelete}
            title="Delete raw material name?"
            description={`This will permanently remove "${deleting?.name}" from the raw material name master.`}
            loading={deleteLoading}
          />
        </>
      ) : null}
    </div>
  );
}
