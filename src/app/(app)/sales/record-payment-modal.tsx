"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import { formatINR } from "@/lib/format";
import type { Sale } from "@/lib/types";

export function RecordPaymentModal({
  sale,
  onClose,
  onSaved,
}: {
  sale: Sale | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Modal open={!!sale} onClose={onClose} title="Record a payment" size="sm">
      {sale ? <RecordPaymentBody sale={sale} onClose={onClose} onSaved={onSaved} /> : null}
    </Modal>
  );
}

function RecordPaymentBody({
  sale,
  onClose,
  onSaved,
}: {
  sale: Sale;
  onClose: () => void;
  onSaved: () => void;
}) {
  const due = Math.max(0, sale.amount - sale.amountPaid);
  const [amount, setAmount] = useState(String(due));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest(`/api/sales/${sale.id}/payment`, {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount) }),
      });
      push("Payment recorded");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-border bg-surface-2 p-3.5 text-sm">
        <p className="text-muted">
          {sale.item.name} · {sale.customer.name}
        </p>
        <p className="mt-1">
          <span className="text-muted">Sale total </span>
          <span className="font-semibold">{formatINR(sale.amount)}</span>
          <span className="text-muted"> · Already paid </span>
          <span className="font-semibold">{formatINR(sale.amountPaid)}</span>
        </p>
        <p className="mt-1">
          <span className="text-muted">Due </span>
          <span className="font-semibold text-brand-gold">{formatINR(due)}</span>
        </p>
      </div>

      <Field label="Payment received now (₹)">
        <Input
          type="number"
          min={0}
          max={due}
          step="any"
          required
          autoFocus
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Record payment"}
        </Button>
      </div>
    </form>
  );
}
