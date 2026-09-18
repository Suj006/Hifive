// Invoice numbers are self-describing: HF-YYYYMMDD-NNN — the date block is
// the sale's own transaction date (not "today"), so a backdated entry still
// numbers correctly, and NNN is that day's running count, starting at 001.
export function invoiceDayPrefix(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `HF-${y}${m}${d}-`;
}

export function buildSaleInvoiceNumber(date: Date, sequenceForDay: number): string {
  return `${invoiceDayPrefix(date)}${String(sequenceForDay).padStart(3, "0")}`;
}
