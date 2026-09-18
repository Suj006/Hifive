"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { apiRequest } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import { todayInputValue, toDateInputValue } from "@/lib/format";
import type { Expense } from "@/lib/types";
import { PAYMENT_MODES, EXPENSE_CATEGORIES } from "@/lib/constants";

interface FormState {
  date: string;
  category: string;
  description: string;
  amount: string;
  paymentMode: string;
  notes: string;
}

function initialState(expense: Expense | null): FormState {
  if (expense) {
    return {
      date: toDateInputValue(expense.date),
      category: expense.category,
      description: expense.description,
      amount: String(expense.amount),
      paymentMode: expense.paymentMode ?? "UPI",
      notes: expense.notes ?? "",
    };
  }
  return {
    date: todayInputValue(),
    category: EXPENSE_CATEGORIES[0],
    description: "",
    amount: "",
    paymentMode: "UPI",
    notes: "",
  };
}

export function ExpenseFormModal({
  open,
  onClose,
  onSaved,
  expense,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  expense: Expense | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title={expense ? "Edit expense" : "Record an expense"} size="lg">
      {open ? (
        <ExpenseFormBody
          key={expense?.id ?? "new"}
          onClose={onClose}
          onSaved={onSaved}
          expense={expense}
        />
      ) : null}
    </Modal>
  );
}

function ExpenseFormBody({
  onClose,
  onSaved,
  expense,
}: {
  onClose: () => void;
  onSaved: () => void;
  expense: Expense | null;
}) {
  const [form, setForm] = useState<FormState>(() => initialState(expense));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        date: form.date,
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        notes: form.notes,
      };
      if (expense) {
        await apiRequest(`/api/expenses/${expense.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        push("Expense updated");
      } else {
        await apiRequest("/api/expenses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        push("Expense recorded");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
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
        <Field label="Category">
          <Select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Description" hint="What was this expense for?">
        <Input
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (₹)">
          <Input
            type="number"
            min={0}
            step="any"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
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
          {saving ? "Saving…" : expense ? "Save changes" : "Record expense"}
        </Button>
      </div>
    </form>
  );
}
