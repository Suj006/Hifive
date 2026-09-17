"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { IconPalette } from "@/components/icons";
import { cn } from "@/lib/cn";
import {
  applyTheme,
  readCurrentTheme,
  resetTheme,
  DEFAULT_THEME,
  THEME_PRESETS,
  THEME_STORAGE_KEY,
  type ThemeColors,
} from "@/lib/theme";

const FIELD_LABELS: { key: keyof ThemeColors; label: string }[] = [
  { key: "pink", label: "Pink" },
  { key: "purple", label: "Purple" },
  { key: "teal", label: "Teal" },
  { key: "gold", label: "Gold" },
];

export function ThemeCustomizerButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground cursor-pointer",
          className
        )}
      >
        <IconPalette className="h-4 w-4" />
        Customize colors
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Customize colors" size="md">
        {open ? <ThemeEditorBody onClose={() => setOpen(false)} /> : null}
      </Modal>
    </>
  );
}

function ThemeEditorBody({ onClose }: { onClose: () => void }) {
  const [baseline] = useState<ThemeColors>(() => readCurrentTheme());
  const [colors, setColors] = useState<ThemeColors>(baseline);
  const { push } = useToast();

  function updateColor(key: keyof ThemeColors, value: string) {
    const next = { ...colors, [key]: value };
    setColors(next);
    applyTheme(next);
  }

  function applyPreset(preset: ThemeColors) {
    setColors(preset);
    applyTheme(preset);
  }

  function handleReset() {
    setColors(DEFAULT_THEME);
    resetTheme();
  }

  function handleCancel() {
    applyTheme(baseline);
    onClose();
  }

  function handleSave() {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(colors));
    } catch {
      // localStorage unavailable (private mode etc.) — theme still applies for this visit
    }
    push("Theme saved");
    onClose();
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.colors)}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-medium transition-colors hover:border-brand-purple-2/60 cursor-pointer"
            >
              <span className="flex -space-x-1">
                {[preset.colors.pink, preset.colors.purple, preset.colors.teal, preset.colors.gold].map(
                  (c, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-full border border-background"
                      style={{ backgroundColor: c }}
                    />
                  )
                )}
              </span>
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Custom colors
        </p>
        <div className="grid grid-cols-2 gap-3">
          {FIELD_LABELS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2"
            >
              <span className="text-sm font-medium">{label}</span>
              <input
                type="color"
                value={colors[key]}
                onChange={(e) => updateColor(key, e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-md border border-border bg-transparent p-0"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Preview</p>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-brand)]" />
          <span className="font-display text-lg font-extrabold brand-text">Hi Five by Jia</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
          Reset to default
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
