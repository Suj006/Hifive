"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { apiRequest, useApi } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import { todayInputValue, toDateInputValue } from "@/lib/format";
import type { Item, Purchase, Vendor } from "@/lib/types";
import { PAYMENT_MODES } from "@/lib/constants";

interface FormState {
  date: string;
  itemId: string;
  vendorId: string;
  quantity: string;
  rate: string;
  amount: string;
  invoiceNumber: string;
  paymentMode: string;
  notes: string;
}

function initialState(purchase: Purchase | null): FormState {
  if (purchase) {
    return {
      date: toDateInputValue(purchase.date),
      itemId: purchase.itemId,
      vendorId: purchase.vendorId,
      quantity: String(purchase.quantity),
      rate: String(purchase.rate),
      amount: String(purchase.amount),
      invoiceNumber: purchase.invoiceNumber ?? "",
      paymentMode: purchase.paymentMode ?? "UPI",
      notes: purchase.notes ?? "",
    };
  }
  return {
    date: todayInputValue(),
    itemId: "",
    vendorId: "",
    quantity: "",
    rate: "",
    amount: "",
    invoiceNumber: "",
    paymentMode: "UPI",
    notes: "",
  };
}

export function PurchaseFormModal({
  open,
  onClose,
  onSaved,
  purchase,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  purchase: Purchase | null;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={purchase ? "Edit purchase" : "Record a purchase"}
      size="lg"
    >
      {open ? (
        <PurchaseFormBody
          key={purchase?.id ?? "new"}
          onClose={onClose}
          onSaved={onSaved}
          purchase={purchase}
        />
      ) : null}
    </Modal>
  );
}

function PurchaseFormBody({
  onClose,
  onSaved,
  purchase,
}: {
  onClose: () => void;
  onSaved: () => void;
  purchase: Purchase | null;
}) {
  const { data: items } = useApi<Item[]>("/api/items?type=RAW_MATERIAL");
  const { data: vendors } = useApi<Vendor[]>("/api/vendors");
  const [form, setForm] = useState<FormState>(() => initialState(purchase));
  // Always starts "untouched" (even when editing) so the Amount field keeps
  // auto-recalculating from Quantity/Rate until the person types into it
  // directly — otherwise editing an existing purchase's quantity or rate
  // silently left the old amount in place.
  const [amountTouched, setAmountTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const q = Number(form.quantity);
  const r = Number(form.rate);
  const computedAmount =
    Number.isFinite(q) && Number.isFinite(r) && form.quantity !== "" && form.rate !== ""
      ? (q * r).toFixed(2)
      : "";
  const displayAmount = amountTouched ? form.amount : computedAmount || form.amount;

  const activeItems = (items ?? []).filter((i) => i.isActive || i.id === purchase?.itemId);
  const activeVendors = (vendors ?? []).filter((v) => v.isActive || v.id === purchase?.vendorId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        date: form.date,
        itemId: form.itemId,
        vendorId: form.vendorId,
        quantity: Number(form.quantity),
        rate: Number(form.rate),
        amount: Number(displayAmount),
        invoiceNumber: form.invoiceNumber,
        paymentMode: form.paymentMode,
        notes: form.notes,
      };
      if (purchase) {
        await apiRequest(`/api/purchases/${purchase.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        push("Purchase updated");
      } else {
        await apiRequest("/api/purchases", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        push("Purchase recorded");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save purchase");
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
          label="Raw material"
          hint={activeItems.length === 0 ? "Add a raw material in Item Master first" : undefined}
        >
          <Select
            required
            value={form.itemId}
            onChange={(e) => setForm({ ...form, itemId: e.target.value })}
          >
            <option value="">Select item</option>
            {activeItems.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.unit})
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Vendor" hint={activeVendors.length === 0 ? "Add a vendor first" : undefined}>
        <Select
          required
          value={form.vendorId}
          onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
        >
          <option value="">Select vendor</option>
          {activeVendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Quantity">
          <Input
            type="number"
            min={0}
            step="any"
            required
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </Field>
        <Field label="Rate (₹ / unit)">
          <Input
            type="number"
            min={0}
            step="any"
            required
            value={form.rate}
            onChange={(e) => setForm({ ...form, rate: e.target.value })}
          />
        </Field>
        <Field label="Amount (₹)">
          <Input
            type="number"
            min={0}
            step="any"
            required
            value={displayAmount}
            onChange={(e) => {
              setAmountTouched(true);
              setForm({ ...form, amount: e.target.value });
            }}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Invoice / Bill No." hint="Optional">
          <Input
            value={form.invoiceNumber}
            onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
          />
        </Field>
        <Field label="Payment mode">
          <Select
            value={form.paymentMode}
            onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
          >
            {PAYMENT_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Notes">
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
          {saving ? "Saving…" : purchase ? "Save changes" : "Record purchase"}
        </Button>
      </div>
    </form>
  );
}
