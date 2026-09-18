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
import type { Coupon } from "@/lib/types";
import { formatINR, formatNumber } from "@/lib/format";
import { IconPlus, IconEdit, IconTrash, IconCoupon } from "@/components/icons";
import { CouponFormModal } from "@/app/(app)/coupons/coupon-form";

function describeDiscount(coupon: Coupon): string {
  if (coupon.discountType === "PERCENT") {
    const cap = coupon.maxDiscount != null ? `, up to ${formatINR(coupon.maxDiscount)}` : "";
    return `${formatNumber(coupon.value)}% off${cap}`;
  }
  return `${formatINR(coupon.value)} off`;
}

export default function CouponsPage() {
  const { data, loading, error, refetch } = useApi<Coupon[]>("/api/coupons");
  const { isAdmin } = useRole();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { push } = useToast();
  const coupons = data ?? [];

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await apiRequest(`/api/coupons/${deleting.id}`, { method: "DELETE" });
      push("Coupon deleted");
      setDeleting(null);
      refetch();
    } catch (err) {
      push(err instanceof Error ? err.message : "Could not delete coupon", "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Coupons"
        description="Discount codes you can apply to a sale — percentage off (with an optional rupee cap) or a flat rupee amount."
        action={
          isAdmin ? (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <IconPlus className="h-4 w-4" /> Add coupon
            </Button>
          ) : undefined
        }
      />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted">Loading…</div>
        ) : error ? (
          <div className="p-6 text-sm text-danger">{error}</div>
        ) : coupons.length === 0 ? (
          <EmptyState
            icon={<IconCoupon className="h-6 w-6 text-brand-purple-2" />}
            title="No coupons yet"
            description="Add a coupon code — like a seasonal discount — to apply it when recording a sale."
            action={
              isAdmin ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  <IconPlus className="h-4 w-4" /> Add coupon
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium">Discount</th>
                  <th className="px-5 py-3 font-medium text-right">Used on</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  {isAdmin ? (
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5 font-mono text-sm font-semibold">{c.code}</td>
                    <td className="px-5 py-3.5">{describeDiscount(c)}</td>
                    <td className="px-5 py-3.5 text-right text-muted">
                      {c._count?.sales ?? 0} sale{c._count?.sales === 1 ? "" : "s"}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.isActive ? (
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
                              setEditing(c);
                              setFormOpen(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/10 hover:text-foreground cursor-pointer"
                            aria-label="Edit"
                          >
                            <IconEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleting(c)}
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
          <CouponFormModal
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSaved={refetch}
            coupon={editing}
          />

          <ConfirmDialog
            open={!!deleting}
            onClose={() => setDeleting(null)}
            onConfirm={handleDelete}
            title="Delete coupon?"
            description={`This will permanently remove "${deleting?.code}".`}
            loading={deleteLoading}
          />
        </>
      ) : null}
    </div>
  );
}
