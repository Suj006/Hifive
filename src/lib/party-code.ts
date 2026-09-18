const CODE_PREFIX = {
  customer: "CUST",
  vendor: "VEND",
} as const;

export function generatePartyCode(kind: "customer" | "vendor", sequence: number): string {
  return `${CODE_PREFIX[kind]}-${String(sequence).padStart(4, "0")}`;
}
