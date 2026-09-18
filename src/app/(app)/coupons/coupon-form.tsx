"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { apiRequest } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import { todayInputValue, toDateInputValue } from "@/lib/format";
import type { Coupon, CouponDiscountType } from "@/lib/types";

interface FormState {
  code: string;
  discountType: CouponDiscountType;
  value: string;
  maxDiscount: string;
  startDate: string;
  endDate: string;
  oncePerCustomer: boolean;
  notes: string;
  isActive: boolean;
}

function initialState(coupon: Coupon | null): FormState {
  if (coupon) {
    return {
      code: coupon.code,
      discountType: coupon.discountType,
      value: String(coupon.value),
      maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
      startDate: toDateInputValue(coupon.startDate),
      endDate: coupon.endDate ? toDateInputValue(coupon.endDate) : "",
      oncePerCustomer: coupon.oncePerCustomer,
      notes: coupon.notes ?? "",
      isActive: coupon.isActive,
    };
  }
  return {
    code: "",
    discountType: "PERCENT",
    value: "",
    maxDiscount: "",
    startDate: todayInputValue(),
    endDate: "",
    oncePerCustomer: false,
    notes: "",
    isActive: true,
  };
}

export function CouponFormModal({
  open,
  onClose,
  onSaved,
  coupon,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  coupon: Coupon | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title={coupon ? "Edit coupon" : "Add coupon"} size="sm">
      {open ? (
        <CouponFormBody key={coupon?.id ?? "new"} onClose={onClose} onSaved={onSaved} coupon={coupon} />
      ) : null}
    </Modal>
  );
}

function CouponFormBody({
  onClose,
  onSaved,
  coupon,
}: {
  onClose: () => void;
  onSaved: () => void;
  coupon: Coupon | null;
}) {
  const [form, setForm] = useState<FormState>(() => initialState(coupon));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        code: form.code,
        discountType: form.discountType,
        value: Number(form.value || 0),
        startDate: form.startDate,
        oncePerCustomer: form.oncePerCustomer,
        notes: form.notes,
        isActive: form.isActive,
      };
      if (form.discountType === "PERCENT" && form.maxDiscount) {
        payload.maxDiscount = Number(form.maxDiscount);
      }
      if (form.endDate) {
        payload.endDate = form.endDate;
      }
      if (coupon) {
        await apiRequest(`/api/coupons/${coupon.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        push("Coupon updated");
      } else {
        await apiRequest("/api/coupons", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        push("Coupon added");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Coupon code" hint="e.g. ONAM2026 — stored in capitals">
        <Input
          required
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          placeholder="ONAM2026"
          className="uppercase"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Discount type">
          <Select
            value={form.discountType}
            onChange={(e) =>
              setForm({ ...form, discountType: e.target.value as CouponDiscountType })
            }
          >
            <option value="PERCENT">Percentage</option>
            <option value="FLAT">Flat amount (₹)</option>
          </Select>
        </Field>
        <Field
          label={form.discountType === "PERCENT" ? "Percentage" : "Amount (₹)"}
          hint={form.discountType === "PERCENT" ? "e.g. 10 for 10% off" : undefined}
        >
          <Input
            type="number"
            min={0}
            max={form.discountType === "PERCENT" ? 100 : undefined}
            step="any"
            required
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
        </Field>
      </div>

      {form.discountType === "PERCENT" ? (
        <Field
          label="Max discount (₹)"
          hint="Optional — caps how much the percentage can discount, e.g. 500"
        >
          <Input
            type="number"
            min={0}
            step="any"
            value={form.maxDiscount}
            onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
            placeholder="No cap"
          />
        </Field>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Start date">
          <Input
            type="date"
            required
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </Field>
        <Field label="End date" hint="Optional — leave blank for no expiry">
          <Input
            type="date"
            min={form.startDate || undefined}
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.oncePerCustomer}
          onChange={(e) => setForm({ ...form, oncePerCustomer: e.target.checked })}
          className="h-4 w-4 rounded border-border accent-[#ec1876]"
        />
        Limit to one use per customer
      </label>

      <Field label="Notes">
        <Textarea
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
          {saving ? "Saving…" : coupon ? "Save changes" : "Add coupon"}
        </Button>
      </div>
    </form>
  );
}
