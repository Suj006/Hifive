"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { apiRequest, useApi } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import { todayInputValue, toDateInputValue, formatNumber } from "@/lib/format";
import type { Item, Production } from "@/lib/types";

const NO_CATEGORY = "__none__";

interface FormState {
  date: string;
  productName: string;
  categoryKey: string;
  quantity: string;
  notes: string;
}

function initialState(production: Production | null): FormState {
  if (production) {
    return {
      date: toDateInputValue(production.date),
      productName: production.item.name,
      categoryKey: production.item.categoryId ?? NO_CATEGORY,
      quantity: String(production.quantity),
      notes: production.notes ?? "",
    };
  }
  return {
    date: todayInputValue(),
    productName: "",
    categoryKey: "",
    quantity: "",
    notes: "",
  };
}

export function ProductionFormModal({
  open,
  onClose,
  onSaved,
  production,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  production: Production | null;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={production ? "Edit production entry" : "Record items made"}
      size="lg"
    >
      {open ? (
        <ProductionFormBody
          key={production?.id ?? "new"}
          onClose={onClose}
          onSaved={onSaved}
          production={production}
        />
      ) : null}
    </Modal>
  );
}

function ProductionFormBody({
  onClose,
  onSaved,
  production,
}: {
  onClose: () => void;
  onSaved: () => void;
  production: Production | null;
}) {
  const { data: items } = useApi<Item[]>("/api/items?type=PRODUCT");
  const [form, setForm] = useState<FormState>(() => initialState(production));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const activeItems = (items ?? []).filter(
    (i) => i.isActive || i.id === production?.itemId
  );

  const productNames = useMemo(
    () => Array.from(new Set(activeItems.map((i) => i.name))).sort(),
    [activeItems]
  );

  const categoryOptions = useMemo(
    () =>
      activeItems
        .filter((i) => i.name === form.productName)
        .map((i) => ({
          key: i.categoryId ?? NO_CATEGORY,
          label: i.category?.name ?? "No category",
          item: i,
        })),
    [activeItems, form.productName]
  );

  const selectedItem = categoryOptions.find((c) => c.key === form.categoryKey)?.item ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) {
      setError("Please select a product and category.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        date: form.date,
        itemId: selectedItem.id,
        quantity: Number(form.quantity),
        notes: form.notes,
      };
      if (production) {
        await apiRequest(`/api/production/${production.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        push("Production entry updated");
      } else {
        await apiRequest("/api/production", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        push("Production recorded");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save production entry");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Date">
          <Input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </Field>
        <Field
          label="Product"
          hint={productNames.length === 0 ? "Add a product in Item Master first" : undefined}
        >
          <Select
            required
            value={form.productName}
            onChange={(e) =>
              setForm({ ...form, productName: e.target.value, categoryKey: "" })
            }
          >
            <option value="">Select product</option>
            {productNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="Category"
          hint={
            !form.productName
              ? "Choose a product first"
              : categoryOptions.length === 1
              ? undefined
              : "Stock is tracked separately per category"
          }
        >
          <Select
            required
            disabled={!form.productName}
            value={form.categoryKey}
            onChange={(e) => setForm({ ...form, categoryKey: e.target.value })}
          >
            <option value="">Select category</option>
            {categoryOptions.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Current stock">
          <div className="flex h-10 items-center rounded-xl border border-border bg-surface-2 px-3.5 text-sm">
            {selectedItem ? (
              <span className="font-semibold">
                {formatNumber(selectedItem.stock ?? 0)} {selectedItem.unit}
              </span>
            ) : (
              <span className="text-muted">—</span>
            )}
          </div>
        </Field>
      </div>

      <Field label="Quantity made">
        <Input
          type="number"
          min={0}
          step="any"
          required
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
      </Field>

      <Field label="Notes" hint="Optional — e.g. batch details">
        <Textarea
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </Field>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : production ? "Save changes" : "Record production"}
        </Button>
      </div>
    </form>
  );
}
