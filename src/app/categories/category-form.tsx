"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import type { Category } from "@/lib/types";

export function CategoryFormModal({
  open,
  onClose,
  onSaved,
  category,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  category: Category | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title={category ? "Edit category" : "Add category"} size="sm">
      {open ? (
        <CategoryFormBody
          key={category?.id ?? "new"}
          onClose={onClose}
          onSaved={onSaved}
          category={category}
        />
      ) : null}
    </Modal>
  );
}

function CategoryFormBody({
  onClose,
  onSaved,
  category,
}: {
  onClose: () => void;
  onSaved: () => void;
  category: Category | null;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (category) {
        await apiRequest(`/api/categories/${category.id}`, {
          method: "PUT",
          body: JSON.stringify({ name, isActive }),
        });
        push("Category updated");
      } else {
        await apiRequest("/api/categories", {
          method: "POST",
          body: JSON.stringify({ name, isActive }),
        });
        push("Category added");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Category name" hint="e.g. Kids, Adults, Male, Female, Unisex">
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kids"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
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
          {saving ? "Saving…" : category ? "Save changes" : "Add category"}
        </Button>
      </div>
    </form>
  );
}
