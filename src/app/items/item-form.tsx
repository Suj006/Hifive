"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { apiRequest, useApi } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import type { Category, Item, ItemType } from "@/lib/types";
import { UNIT_OPTIONS } from "@/lib/units";

interface FormState {
  name: string;
  type: ItemType;
  unit: string;
  customUnit: string;
  group: string;
  categoryId: string;
  openingStock: string;
  reorderLevel: string;
  notes: string;
  isActive: boolean;
}

function initialState(item: Item | null, defaultType?: ItemType): FormState {
  if (item) {
    const knownUnit = (UNIT_OPTIONS as readonly string[]).includes(item.unit);
    return {
      name: item.name,
      type: item.type,
      unit: knownUnit ? item.unit : "other",
      customUnit: knownUnit ? "" : item.unit,
      group: item.group ?? "",
      categoryId: item.categoryId ?? "",
      openingStock: String(item.openingStock),
      reorderLevel: String(item.reorderLevel),
      notes: item.notes ?? "",
      isActive: item.isActive,
    };
  }
  return {
    name: "",
    type: defaultType ?? "RAW_MATERIAL",
    unit: "pcs",
    customUnit: "",
    group: "",
    categoryId: "",
    openingStock: "0",
    reorderLevel: "0",
    notes: "",
    isActive: true,
  };
}

export function ItemFormModal({
  open,
  onClose,
  onSaved,
  item,
  defaultType,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  item: Item | null;
  defaultType?: ItemType;
}) {
  return (
    <Modal open={open} onClose={onClose} title={item ? "Edit item" : "Add item to master"}>
      {open ? (
        <ItemFormBody
          key={item?.id ?? "new"}
          onClose={onClose}
          onSaved={onSaved}
          item={item}
          defaultType={defaultType}
        />
      ) : null}
    </Modal>
  );
}

function ItemFormBody({
  onClose,
  onSaved,
  item,
  defaultType,
}: {
  onClose: () => void;
  onSaved: () => void;
  item: Item | null;
  defaultType?: ItemType;
}) {
  const [form, setForm] = useState<FormState>(() => initialState(item, defaultType));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();
  const { data: categories } = useApi<Category[]>("/api/categories");
  const activeCategories = (categories ?? []).filter(
    (c) => c.isActive || c.id === item?.categoryId
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const unit = form.unit === "other" ? form.customUnit.trim() : form.unit;
      if (!unit) {
        setError("Please enter a unit.");
        setSaving(false);
        return;
      }
      const payload = {
        name: form.name,
        type: form.type,
        unit,
        group: form.group,
        categoryId: form.type === "PRODUCT" ? form.categoryId : "",
        openingStock: Number(form.openingStock || 0),
        reorderLevel: Number(form.reorderLevel || 0),
        notes: form.notes,
        isActive: form.isActive,
      };
      if (item) {
        await apiRequest(`/api/items/${item.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        push("Item updated");
      } else {
        await apiRequest("/api/items", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        push("Item added to master");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {item ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Item code: <span className="text-foreground">{item.code}</span>
        </p>
      ) : null}

      <Field label="Item name">
        <Input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Silk Thread — Pink"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <Select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as ItemType })}
          >
            <option value="RAW_MATERIAL">Raw material</option>
            <option value="PRODUCT">Finished product</option>
          </Select>
        </Field>
        <Field label="Unit">
          <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
            <option value="other">Other…</option>
          </Select>
        </Field>
      </div>

      {form.unit === "other" ? (
        <Field label="Custom unit">
          <Input
            required
            value={form.customUnit}
            onChange={(e) => setForm({ ...form, customUnit: e.target.value })}
            placeholder="e.g. bundle"
          />
        </Field>
      ) : null}

      {form.type === "PRODUCT" ? (
        <Field
          label="Category"
          hint={
            activeCategories.length === 0 ? (
              <>
                No categories yet —{" "}
                <Link href="/categories" className="underline">
                  add one
                </Link>{" "}
                (Kids, Adults, Male, Female…)
              </>
            ) : undefined
          }
        >
          <Select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">No category</option>
            {activeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <Field label="Group" hint="Optional, e.g. Beads, Thread, Bracelet">
        <Input
          value={form.group}
          onChange={(e) => setForm({ ...form, group: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Opening stock">
          <Input
            type="number"
            min={0}
            step="any"
            value={form.openingStock}
            onChange={(e) => setForm({ ...form, openingStock: e.target.value })}
          />
        </Field>
        <Field label="Reorder level" hint="Alert when stock falls to this">
          <Input
            type="number"
            min={0}
            step="any"
            value={form.reorderLevel}
            onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Notes">
        <Textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="h-4 w-4 rounded border-border accent-[#ec1876]"
        />
        Active
      </label>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : item ? "Save changes" : "Add item"}
        </Button>
      </div>
    </form>
  );
}
