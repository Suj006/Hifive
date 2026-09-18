"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { apiRequest, useApi } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import { todayInputValue, toDateInputValue, formatNumber, formatINR } from "@/lib/format";
import type { Customer, Item, Sale } from "@/lib/types";
import { PAYMENT_MODES } from "@/lib/constants";

const NO_CATEGORY = "__none__";

interface FormState {
  date: string;
  productName: string;
  categoryKey: string;
  customerId: string;
  quantity: string;
  rate: string;
  discount: string;
  amount: string;
  amountPaid: string;
  invoiceNumber: string;
  paymentMode: string;
  notes: string;
}

function initialState(sale: Sale | null): FormState {
  if (sale) {
    return {
      date: toDateInputValue(sale.date),
      productName: sale.item.name,
      categoryKey: sale.item.categoryId ?? NO_CATEGORY,
      customerId: sale.customerId,
      quantity: String(sale.quantity),
      rate: String(sale.rate),
      discount: String(sale.discount),
      amount: String(sale.amount),
      amountPaid: String(sale.amountPaid),
      invoiceNumber: sale.invoiceNumber ?? "",
      paymentMode: sale.paymentMode ?? "UPI",
      notes: sale.notes ?? "",
    };
  }
  return {
    date: todayInputValue(),
    productName: "",
    categoryKey: "",
    customerId: "",
    quantity: "",
    rate: "",
    discount: "0",
    amount: "",
    amountPaid: "",
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
  // Always starts "untouched" (even when editing) so the Amount field keeps
  // auto-recalculating from Quantity/Rate/Discount until the person types
  // into it directly — otherwise editing an existing sale's quantity or
  // rate silently left the old amount in place.
  const [amountTouched, setAmountTouched] = useState(false);
  // Starts "touched" only when editing a sale that already has a real due —
  // otherwise it tracks the Amount field (i.e. "paid in full") the same way
  // Amount tracks Quantity × Rate, until the person types into it directly.
  const [amountPaidTouched, setAmountPaidTouched] = useState(
    () => !!sale && sale.amountPaid < sale.amount
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const activeItems = (items ?? []).filter((i) => i.isActive || i.id === sale?.itemId);
  const activeCustomers = (customers ?? []).filter((c) => c.isActive || c.id === sale?.customerId);

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

  const availableStock = useMemo(() => {
    if (!selectedItem) return null;
    const base = selectedItem.stock ?? 0;
    // This sale's own quantity is already subtracted from the item's stock, so add
    // it back when re-editing the same item — it's being replaced, not added on top.
    if (sale && sale.itemId === selectedItem.id) return base + sale.quantity;
    return base;
  }, [selectedItem, sale]);

  const q = Number(form.quantity);
  const r = Number(form.rate);
  const d = Number(form.discount || 0);
  const computedAmount =
    Number.isFinite(q) && Number.isFinite(r) && form.quantity !== "" && form.rate !== ""
      ? Math.max(0, q * r - d).toFixed(2)
      : "";
  const displayAmount = amountTouched ? form.amount : computedAmount || form.amount;
  const displayAmountPaid = amountPaidTouched ? form.amountPaid : displayAmount;
  const dueAmount = Math.max(0, Number(displayAmount || 0) - Number(displayAmountPaid || 0));

  const quantityExceedsStock =
    availableStock !== null && form.quantity !== "" && q > availableStock;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) {
      setError("Please select a product and category.");
      return;
    }
    if (quantityExceedsStock) {
      setError(`Only ${formatNumber(availableStock ?? 0)} in stock — reduce the quantity.`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        date: form.date,
        itemId: selectedItem.id,
        customerId: form.customerId,
        quantity: Number(form.quantity),
        rate: Number(form.rate),
        discount: Number(form.discount || 0),
        amount: Number(displayAmount),
        amountPaid: Number(displayAmountPaid || 0),
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

        <Field label="Available stock">
          <div className="flex h-10 items-center rounded-xl border border-border bg-surface-2 px-3.5 text-sm">
            {selectedItem ? (
              <span
                className={
                  quantityExceedsStock ? "font-semibold text-danger" : "font-semibold"
                }
              >
                {formatNumber(availableStock ?? 0)} {selectedItem.unit}
              </span>
            ) : (
              <span className="text-muted">—</span>
            )}
          </div>
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
            max={availableStock ?? undefined}
            step="any"
            required
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className={quantityExceedsStock ? "border-danger focus:border-danger" : undefined}
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
      {quantityExceedsStock ? (
        <p className="-mt-2 text-sm text-danger">
          Only {formatNumber(availableStock ?? 0)} {selectedItem?.unit} in stock.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Amount received (₹)"
          hint={
            dueAmount > 0
              ? `Due: ${formatINR(dueAmount)}`
              : "Leave as-is if paid in full"
          }
        >
          <Input
            type="number"
            min={0}
            max={Number(displayAmount) || undefined}
            step="any"
            value={displayAmountPaid}
            onChange={(e) => {
              setAmountPaidTouched(true);
              setForm({ ...form, amountPaid: e.target.value });
            }}
            className={dueAmount > 0 ? "border-brand-gold focus:border-brand-gold" : undefined}
          />
        </Field>
        <Field label="Due (₹)">
          <div className="flex h-10 items-center rounded-xl border border-border bg-surface-2 px-3.5 text-sm">
            <span className={dueAmount > 0 ? "font-semibold text-brand-gold" : "text-muted"}>
              {formatINR(dueAmount)}
            </span>
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Invoice No."
          hint={sale ? "Assigned when this sale was recorded" : "Assigned automatically when you save"}
        >
          <Input
            disabled
            value={form.invoiceNumber}
            placeholder={sale ? undefined : "HF-… (auto-generated)"}
            className="text-muted"
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
        <Button type="submit" disabled={saving || quantityExceedsStock}>
          {saving ? "Saving…" : sale ? "Save changes" : "Record sale"}
        </Button>
      </div>
    </form>
  );
}
