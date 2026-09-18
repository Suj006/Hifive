"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { apiRequest } from "@/lib/use-api";
import { useToast } from "@/components/ui/toast";
import type { Customer, Vendor } from "@/lib/types";
import { MONTH_NAMES, DAYS_IN_MONTH } from "@/lib/dob";

interface FormState {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  isActive: boolean;
  dobMonth: string;
  dobDay: string;
}

function initialState(party: Vendor | Customer | null): FormState {
  const dob = party && "dobMonth" in party ? party : null;
  if (party) {
    return {
      name: party.name,
      phone: party.phone ?? "",
      email: party.email ?? "",
      address: party.address ?? "",
      notes: party.notes ?? "",
      isActive: party.isActive,
      dobMonth: dob?.dobMonth ? String(dob.dobMonth) : "",
      dobDay: dob?.dobDay ? String(dob.dobDay) : "",
    };
  }
  return {
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    isActive: true,
    dobMonth: "",
    dobDay: "",
  };
}

export function PartyFormModal({
  open,
  onClose,
  onSaved,
  party,
  kind,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  party: Vendor | Customer | null;
  kind: "vendor" | "customer";
}) {
  const label = kind === "vendor" ? "Vendor" : "Customer";
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={party ? `Edit ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
    >
      {open ? (
        <PartyFormBody
          key={party?.id ?? "new"}
          onClose={onClose}
          onSaved={onSaved}
          party={party}
          kind={kind}
        />
      ) : null}
    </Modal>
  );
}

function PartyFormBody({
  onClose,
  onSaved,
  party,
  kind,
}: {
  onClose: () => void;
  onSaved: () => void;
  party: Vendor | Customer | null;
  kind: "vendor" | "customer";
}) {
  const [form, setForm] = useState<FormState>(() => initialState(party));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();
  const endpoint = kind === "vendor" ? "/api/vendors" : "/api/customers";
  const label = kind === "vendor" ? "Vendor" : "Customer";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        notes: form.notes,
        isActive: form.isActive,
      };
      if (kind === "customer") {
        if (form.dobMonth) payload.dobMonth = Number(form.dobMonth);
        if (form.dobDay) payload.dobDay = Number(form.dobDay);
      }
      if (party) {
        await apiRequest(`${endpoint}/${party.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        push(`${label} updated`);
      } else {
        await apiRequest(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        push(`${label} added`);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to save ${label.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name">
        <Input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone">
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91"
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
      </div>
      {kind === "customer" ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Birthday — month" hint="No year needed, just for wishing them">
            <Select
              value={form.dobMonth}
              onChange={(e) =>
                setForm({
                  ...form,
                  dobMonth: e.target.value,
                  dobDay:
                    e.target.value &&
                    Number(form.dobDay) > DAYS_IN_MONTH[Number(e.target.value) - 1]
                      ? ""
                      : form.dobDay,
                })
              }
            >
              <option value="">Not set</option>
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Birthday — day">
            <Select
              disabled={!form.dobMonth}
              value={form.dobDay}
              onChange={(e) => setForm({ ...form, dobDay: e.target.value })}
            >
              <option value="">Not set</option>
              {Array.from(
                { length: form.dobMonth ? DAYS_IN_MONTH[Number(form.dobMonth) - 1] : 31 },
                (_, i) => i + 1
              ).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      ) : null}
      <Field label="Address">
        <Textarea
          rows={2}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </Field>
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
          {saving ? "Saving…" : party ? "Save changes" : `Add ${label.toLowerCase()}`}
        </Button>
      </div>
    </form>
  );
}
