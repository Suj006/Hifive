"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface ComboboxOption {
  value: string;
  label: string;
  // Shown under the label and matched by search — e.g. a phone number or
  // code, so options that share a label (same-name customers) stay tellable
  // apart.
  sublabel?: string;
}

const fieldClasses =
  "w-full h-10 rounded-xl bg-surface-2 border border-border px-3.5 text-sm text-foreground placeholder:text-muted/70 outline-none transition-colors focus:border-brand-purple-2 focus:ring-2 focus:ring-brand-purple-2/20 disabled:opacity-50";

export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder = "Search by name or phone…",
  emptyText = "No matches",
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || (o.sublabel ?? "").toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function selectOption(option: ComboboxOption) {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const option = filtered[highlighted];
      if (option) selectOption(option);
    }
  }

  const displayValue = open
    ? query
    : selected
    ? selected.sublabel
      ? `${selected.label} — ${selected.sublabel}`
      : selected.label
    : "";

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        type="text"
        autoComplete="off"
        disabled={disabled}
        className={fieldClasses}
        placeholder={placeholder}
        value={displayValue}
        onFocus={() => {
          setOpen(true);
          setQuery("");
          setHighlighted(0);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onKeyDown={handleKeyDown}
      />
      {open ? (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto scrollbar-thin rounded-xl border border-border bg-surface shadow-xl">
          {filtered.length === 0 ? (
            <div className="px-3.5 py-2.5 text-sm text-muted">{emptyText}</div>
          ) : (
            filtered.map((option, i) => (
              <button
                type="button"
                key={option.value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectOption(option)}
                className={cn(
                  "flex w-full flex-col items-start px-3.5 py-2 text-left text-sm cursor-pointer",
                  i === highlighted ? "bg-white/10" : "hover:bg-white/5",
                  option.value === value && "text-brand-pink-2"
                )}
              >
                <span className="font-medium">{option.label}</span>
                {option.sublabel ? (
                  <span className="text-xs text-muted">{option.sublabel}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
