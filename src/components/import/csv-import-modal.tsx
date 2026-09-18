"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { parseCsvRows, downloadCsv } from "@/lib/csv";
import { IconUpload, IconDownload, IconAlert } from "@/components/icons";

export interface CsvColumn {
  key: string;
  label: string;
  required?: boolean;
}

type RowStatus = "new" | "duplicate-in-file" | "existing" | "invalid";

interface PreviewRow {
  data: Record<string, string>;
  status: RowStatus;
  reason?: string;
}

const STATUS_LABEL: Record<RowStatus, string> = {
  new: "New",
  "duplicate-in-file": "Duplicate in file",
  existing: "Already exists",
  invalid: "Invalid",
};

const STATUS_TONE: Record<RowStatus, "success" | "gold" | "neutral" | "danger"> = {
  new: "success",
  "duplicate-in-file": "gold",
  existing: "neutral",
  invalid: "danger",
};

export function CsvImportModal({
  open,
  onClose,
  onImported,
  title,
  entityLabelPlural,
  columns,
  templateFilename,
  existingKeys,
  dedupeKey,
  rowError,
  importRows,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
  title: string;
  entityLabelPlural: string;
  columns: CsvColumn[];
  templateFilename: string;
  existingKeys: Set<string>;
  dedupeKey: (row: Record<string, string>) => string;
  rowError?: (row: Record<string, string>) => string | null;
  importRows: (rows: Record<string, string>[]) => Promise<{ imported: number; skipped: number }>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const { push } = useToast();

  const newRows = rows.filter((r) => r.status === "new");
  const counts = {
    new: newRows.length,
    "duplicate-in-file": rows.filter((r) => r.status === "duplicate-in-file").length,
    existing: rows.filter((r) => r.status === "existing").length,
    invalid: rows.filter((r) => r.status === "invalid").length,
  };

  function reset() {
    setFileName(null);
    setRows([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseCsvRows(text, columns);
    const seenInFile = new Set<string>();

    const preview: PreviewRow[] = parsed.map((data) => {
      const missing = columns.filter((c) => c.required && !data[c.key]?.trim());
      if (missing.length > 0) {
        return {
          data,
          status: "invalid",
          reason: `Missing ${missing.map((c) => c.label).join(", ")}`,
        };
      }
      const custom = rowError?.(data);
      if (custom) {
        return { data, status: "invalid", reason: custom };
      }
      const key = dedupeKey(data);
      if (seenInFile.has(key)) {
        return { data, status: "duplicate-in-file", reason: "Same as an earlier row in this file" };
      }
      seenInFile.add(key);
      if (existingKeys.has(key)) {
        return { data, status: "existing", reason: "Already in your records" };
      }
      return { data, status: "new" };
    });

    setRows(preview);
  }

  async function handleConfirmImport() {
    setImporting(true);
    try {
      const result = await importRows(newRows.map((r) => r.data));
      push(
        result.skipped > 0
          ? `Imported ${result.imported} ${entityLabelPlural}, skipped ${result.skipped}`
          : `Imported ${result.imported} ${entityLabelPlural}`
      );
      onImported();
      setConfirmOpen(false);
      handleClose();
    } catch (err) {
      push(err instanceof Error ? err.message : "Import failed", "error");
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <Modal open={open} onClose={handleClose} title={title} size="lg">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-surface-2/60 p-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div>
              <p className="text-sm font-medium text-foreground">
                {fileName ?? `Choose a CSV file of ${entityLabelPlural}`}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                First row must be a header: {columns.map((c) => c.label).join(", ")}
              </p>
            </div>
            <div className="flex shrink-0 justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  downloadCsv(
                    templateFilename,
                    [Object.fromEntries(columns.map((c) => [c.label, ""]))]
                  )
                }
              >
                <IconDownload className="h-4 w-4" /> Template
              </Button>
              <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()}>
                <IconUpload className="h-4 w-4" /> Choose file
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          </div>

          {rows.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge tone="success">{counts.new} new</Badge>
                {counts["duplicate-in-file"] > 0 ? (
                  <Badge tone="gold">{counts["duplicate-in-file"]} duplicate in file</Badge>
                ) : null}
                {counts.existing > 0 ? (
                  <Badge tone="neutral">{counts.existing} already exist</Badge>
                ) : null}
                {counts.invalid > 0 ? (
                  <Badge tone="danger">{counts.invalid} invalid</Badge>
                ) : null}
              </div>

              <div className="max-h-72 overflow-auto rounded-xl border border-border scrollbar-thin">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface">
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      {columns.map((c) => (
                        <th key={c.key} className="px-4 py-2.5 font-medium">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-border/60 last:border-0">
                        <td className="px-4 py-2.5">
                          <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                          {r.reason ? (
                            <p className="mt-1 text-[11px] text-muted">{r.reason}</p>
                          ) : null}
                        </td>
                        {columns.map((c) => (
                          <td key={c.key} className="px-4 py-2.5 text-muted">
                            {r.data[c.key] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {counts.new === 0 ? (
                <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                  <IconAlert className="h-4 w-4 shrink-0" />
                  Nothing new to import — every row is a duplicate or invalid.
                </div>
              ) : null}
            </>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={counts.new === 0}
              onClick={() => setConfirmOpen(true)}
            >
              Import {counts.new > 0 ? counts.new : ""} {entityLabelPlural}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => (importing ? null : setConfirmOpen(false))}
        onConfirm={handleConfirmImport}
        title={`Import ${counts.new} ${entityLabelPlural}?`}
        description="Duplicate and invalid rows shown above will be skipped. This can't be undone in bulk — you'd need to remove them one by one."
        confirmLabel="Import"
        confirmVariant="primary"
        loading={importing}
      />
    </>
  );
}
