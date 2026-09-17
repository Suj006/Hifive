import type { ItemType } from "@/lib/types";

const CODE_PREFIX: Record<ItemType, string> = {
  RAW_MATERIAL: "RM",
  PRODUCT: "PD",
};

export function generateItemCode(type: ItemType, sequence: number): string {
  return `${CODE_PREFIX[type]}-${String(sequence).padStart(4, "0")}`;
}

export function computeVariantKey(
  name: string,
  type: ItemType,
  categoryId: string | null | undefined
): string {
  return `${name.trim().toLowerCase()}|${type}|${categoryId ?? ""}`;
}
