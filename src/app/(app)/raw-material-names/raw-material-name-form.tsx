"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import type { RawMaterialName } from "@/lib/types";

export function RawMaterialNameFormModal({
  open,
  onClose,
  onSaved,
  rawMaterialName,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  rawMaterialName: RawMaterialName | null;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={rawMaterialName ? "Edit raw material name" : "Add raw material name"}
      size="sm"
    >
      {open ? (
        <RawMaterialNameFormBody
          key={rawMaterialName?.id ?? "new"}
          onClose={onClose}
          onSaved={onSaved}
          rawMaterialName={rawMaterialName}
        />
      ) : null}
    </Modal>
  );
}

function RawMaterialNameFormBody({
  onClose,
  onSaved,
  rawMaterialName,
}: {
  onClose: () => void;
  onSaved: () => void;
  rawMaterialName: RawMaterialName | null;
}) {
  const [name, setName] = useState(rawMaterialName?.name ?? "");
  const [isActive, setIsActive] = useState(rawMaterialName?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (rawMaterialName) {
        await apiRequest(`/api/raw-material-names/${rawMaterialName.id}`, {
          method: "PUT",
          body: JSON.stringify({ name, isActive }),
        });
        push("Raw material name updated");
      } else {
        await apiRequest("/api/raw-material-names", {
          method: "POST",
          body: JSON.stringify({ name, isActive }),
        });
        push("Raw material name added");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save raw material name");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Raw material name" hint="e.g. Silk Thread — Pink, Metal Charm — Heart">
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Silk Thread — Pink"
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
          {saving ? "Saving…" : rawMaterialName ? "Save changes" : "Add raw material name"}
        </Button>
      </div>
    </form>
  );
}
