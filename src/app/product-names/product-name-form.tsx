"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import type { ProductName } from "@/lib/types";

export function ProductNameFormModal({
  open,
  onClose,
  onSaved,
  productName,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  productName: ProductName | null;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={productName ? "Edit product name" : "Add product name"}
      size="sm"
    >
      {open ? (
        <ProductNameFormBody
          key={productName?.id ?? "new"}
          onClose={onClose}
          onSaved={onSaved}
          productName={productName}
        />
      ) : null}
    </Modal>
  );
}

function ProductNameFormBody({
  onClose,
  onSaved,
  productName,
}: {
  onClose: () => void;
  onSaved: () => void;
  productName: ProductName | null;
}) {
  const [name, setName] = useState(productName?.name ?? "");
  const [isActive, setIsActive] = useState(productName?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (productName) {
        await apiRequest(`/api/product-names/${productName.id}`, {
          method: "PUT",
          body: JSON.stringify({ name, isActive }),
        });
        push("Product name updated");
      } else {
        await apiRequest("/api/product-names", {
          method: "POST",
          body: JSON.stringify({ name, isActive }),
        });
        push("Product name added");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product name");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Product name" hint="e.g. Bracelet, Chain, Keychain, Bow">
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Keychain"
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
          {saving ? "Saving…" : productName ? "Save changes" : "Add product name"}
        </Button>
      </div>
    </form>
  );
}
