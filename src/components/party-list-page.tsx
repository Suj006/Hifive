"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import type { Customer, Vendor } from "@/lib/types";
import { IconPlus, IconEdit, IconTrash, IconSearch, IconUpload } from "@/components/icons";
import { PartyFormModal } from "@/components/party-form";
import { CsvImportModal, type CsvColumn } from "@/components/import/csv-import-modal";

const PARTY_IMPORT_COLUMNS: CsvColumn[] = [
  { key: "name", label: "Name", required: true },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "notes", label: "Notes" },
];

type Party = Vendor | Customer;

export function PartyListPage({
  kind,
  title,
  description,
  icon,
}: {
  kind: "vendor" | "customer";
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  const endpoint = kind === "vendor" ? "/api/vendors" : "/api/customers";
  const label = kind === "vendor" ? "Vendor" : "Customer";
  const { data, loading, error, refetch } = useApi<Party[]>(endpoint);
  const { isAdmin } = useRole();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Party | null>(null);
  const [deleting, setDeleting] = useState<Party | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { push } = useToast();

  const existingKeys = useMemo(
    () => new Set((data ?? []).map((p) => p.name.trim().toLowerCase())),
    [data]
  );

  const parties = useMemo(() => {
    let list = data ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.phone ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search]);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await apiRequest(`${endpoint}/${deleting.id}`, { method: "DELETE" });
      push(`${label} deleted`);
      setDeleting(null);
      refetch();
    } catch (err) {
      push(err instanceof Error ? err.message : `Could not delete ${label.toLowerCase()}`, "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const entryCount = (p: Party) =>
    "purchases" in (p._count ?? {})
      ? (p._count as { purchases: number }).purchases
      : (p._count as { sales: number }).sales;

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          isAdmin ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                <IconUpload className="h-4 w-4" /> Import CSV
              </Button>
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <IconPlus className="h-4 w-4" /> Add {label.toLowerCase()}
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="mb-4">
        <div className="relative w-full sm:w-72">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder={`Search ${label.toLowerCase()}s…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted">Loading…</div>
        ) : error ? (
          <div className="p-6 text-sm text-danger">{error}</div>
        ) : parties.length === 0 ? (
          <EmptyState
            icon={icon}
            title={`No ${label.toLowerCase()}s yet`}
            description={`Add a ${label.toLowerCase()} to start recording ${
              kind === "vendor" ? "purchases" : "sales"
            } against them.`}
            action={
              isAdmin ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  <IconPlus className="h-4 w-4" /> Add {label.toLowerCase()}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium text-right">
                    {kind === "vendor" ? "Purchases" : "Sales"}
                  </th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  {isAdmin ? (
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {parties.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 font-medium">
                      {kind === "customer" ? (
                        <Link
                          href={`/customers/${p.id}`}
                          className="hover:text-brand-pink-2 hover:underline"
                        >
                          {p.name}
                        </Link>
                      ) : (
                        p.name
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{p.phone || "—"}</td>
                    <td className="px-5 py-3.5 text-muted">{p.email || "—"}</td>
                    <td className="px-5 py-3.5 text-right text-muted">
                      {entryCount(p)}
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
          <PartyFormModal
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSaved={refetch}
            party={editing}
            kind={kind}
          />

          <ConfirmDialog
            open={!!deleting}
            onClose={() => setDeleting(null)}
            onConfirm={handleDelete}
            title={`Delete ${label.toLowerCase()}?`}
            description={`This will permanently remove "${deleting?.name}".`}
            loading={deleteLoading}
          />

          <CsvImportModal
            open={importOpen}
            onClose={() => setImportOpen(false)}
            onImported={refetch}
            title={`Import ${label.toLowerCase()}s from CSV`}
            entityLabelPlural={`${label.toLowerCase()}s`}
            columns={PARTY_IMPORT_COLUMNS}
            templateFilename={`${kind}s-template.csv`}
            existingKeys={existingKeys}
            dedupeKey={(row) => row.name.trim().toLowerCase()}
            importRows={(rows) =>
              apiRequest(`${endpoint}/bulk-import`, {
                method: "POST",
                body: JSON.stringify({ rows }),
              })
            }
          />
        </>
      ) : null}
    </div>
  );
}
