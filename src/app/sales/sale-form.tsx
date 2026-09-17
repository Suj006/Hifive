"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { apiRequest, useApi } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import { todayInputValue, toDateInputValue } from "@/lib/format";
import type { Customer, Item, Sale } from "@/lib/types";

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Card", "Other"];

interface FormState {
  date: string;
  itemId: string;
  customerId: string;
  quantity: string;
  rate: string;
  discount: string;
  amount: string;
  invoiceNumber: string;
  paymentMode: string;
  notes: string;
}

function initialState(sale: Sale | null): FormState {
  if (sale) {
    return {
      date: toDateInputValue(sale.date),
      itemId: sale.itemId,
      customerId: sale.customerId,
      quantity: String(sale.quantity),
      rate: String(sale.rate),
      discount: String(sale.discount),
      amount: String(sale.amount),
      invoiceNumber: sale.invoiceNumber ?? "",
      paymentMode: sale.paymentMode ?? "UPI",
      notes: sale.notes ?? "",
    };
  }
  return {
    date: todayInputValue(),
    itemId: "",
    customerId: "",
    quantity: "",
    rate: "",
    discount: "0",
    amount: "",
    invoiceNumber: "",
    paymentMode: "UPI",
    notes: "",
  };
}

export function SaleFormModal({
  open,
  onClose,
  onSaved,
  sale,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  sale: Sale | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title={sale ? "Edit sale" : "Record a sale"} size="lg">
      {open ? (
        <SaleFormBody key={sale?.id ?? "new"} onClose={onClose} onSaved={onSaved} sale={sale} />
      ) : null}
    </Modal>
  );
}

function SaleFormBody({
  onClose,
  onSaved,
  sale,
}: {
  onClose: () => void;
  onSaved: () => void;
  sale: Sale | null;
}) {
  const { data: items } = useApi<Item[]>("/api/items?type=PRODUCT");
  const { data: customers } = useApi<Customer[]>("/api/customers");
  const [form, setForm] = useState<FormState>(() => initialState(sale));
  const [amountTouched, setAmountTouched] = useState(!!sale);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const q = Number(form.quantity);
  const r = Number(form.rate);
  const d = Number(form.discount || 0);
  const computedAmount =
    Number.isFinite(q) && Number.isFinite(r) && form.quantity !== "" && form.rate !== ""
      ? Math.max(0, q * r - d).toFixed(2)
      : "";
  const displayAmount = amountTouched ? form.amount : computedAmount || form.amount;

  const activeItems = (items ?? []).filter((i) => i.isActive || i.id === sale?.itemId);
  const activeCustomers = (customers ?? []).filter((c) => c.isActive || c.id === sale?.customerId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        date: form.date,
        itemId: form.itemId,
        customerId: form.customerId,
        quantity: Number(form.quantity),
        rate: Number(form.rate),
        discount: Number(form.discount || 0),
        amount: Number(displayAmount),
        invoiceNumber: form.invoiceNumber,
        paymentMode: form.paymentMode,
        notes: form.notes,
      };
      if (sale) {
        await apiRequest(`/api/sales/${sale.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        push("Sale updated");
      } else {
        await apiRequest("/api/sales", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        push("Sale recorded");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sale");
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
          hint={activeItems.length === 0 ? "Add a product in Item Master first" : undefined}
        >
          <Select
            required
            value={form.itemId}
            onChange={(e) => setForm({ ...form, itemId: e.target.value })}
          >
            <option value="">Select product</option>
            {activeItems.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.unit})
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Customer"
        hint={activeCustomers.length === 0 ? "Add a customer first" : undefined}
      >
        <Select
          required
          value={form.customerId}
          onChange={(e) => setForm({ ...form, customerId: e.target.value })}
        >
          <option value="">Select customer</option>
          {activeCustomers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        <Field label="Rate (₹)">
          <Input
            type="number"
            min={0}
            step="any"
            required
            value={form.rate}
            onChange={(e) => setForm({ ...form, rate: e.target.value })}
          />
        </Field>
        <Field label="Discount (₹)">
          <Input
            type="number"
            min={0}
            step="any"
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
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
        <Field label="Invoice No." hint="Optional">
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
          {saving ? "Saving…" : sale ? "Save changes" : "Record sale"}
        </Button>
      </div>
    </form>
  );
}
