// Minimal RFC4180-ish CSV parser: handles quoted fields, escaped `""`
// quotes, commas and newlines inside quotes, and both \r\n and \n line
// endings. Good enough for spreadsheet exports (Excel/Google Sheets),
// not a general-purpose CSV library.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < src.length; i++) {
    const char = src[i];
    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/** Parses a CSV's header + data rows into objects keyed by header label (case/whitespace-insensitive match against `columns`). */
export function parseCsvRows(
  text: string,
  columns: { key: string; label: string }[]
): Record<string, string>[] {
  const [headerRow, ...dataRows] = parseCsv(text);
  if (!headerRow) return [];
  const norm = (s: string) => s.trim().toLowerCase();
  const colByHeader = new Map(columns.map((c) => [norm(c.label), c.key]));
  const indexToKey = headerRow.map((h) => colByHeader.get(norm(h)) ?? null);

  return dataRows.map((cells) => {
    const obj: Record<string, string> = {};
    indexToKey.forEach((key, i) => {
      if (key) obj[key] = (cells[i] ?? "").trim();
    });
    return obj;
  });
}

export function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => {
    const str = String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  // The UTF-8 BOM is what makes Excel on Windows render ₹ and — correctly —
  // without it, Excel guesses the system ANSI codepage instead of UTF-8 and
  // every non-ASCII character (rupee sign, em dash, …) comes out garbled.
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
