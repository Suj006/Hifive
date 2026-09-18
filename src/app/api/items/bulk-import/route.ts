import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling, jsonError } from "@/lib/api";
import { generateItemCode, computeVariantKey } from "@/lib/item-code";
import type { ItemType } from "@/lib/types";

interface ImportRow {
  name: string;
  type: string;
  unit: string;
  group?: string;
  category?: string;
  openingStock?: string;
  reorderLevel?: string;
  notes?: string;
}

function toNumber(value: string | undefined, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const rows = Array.isArray(body.rows) ? (body.rows as ImportRow[]) : [];
    if (rows.length === 0) return jsonError("No rows to import", 400);

    const [categories, productNames, rawMaterialNames, existingItems] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.productName.findMany({ select: { name: true } }),
      prisma.rawMaterialName.findMany({ select: { name: true } }),
      prisma.item.findMany({ select: { variantKey: true, type: true } }),
    ]);
    const categoryByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c.id]));
    const knownProductNames = new Set(productNames.map((p) => p.name.trim().toLowerCase()));
    const knownRawMaterialNames = new Set(rawMaterialNames.map((p) => p.name.trim().toLowerCase()));
    const existingVariantKeys = new Set(existingItems.map((i) => i.variantKey));
    const seenInBatch = new Set<string>();
    const sequence: Record<ItemType, number> = {
      RAW_MATERIAL: existingItems.filter((i) => i.type === "RAW_MATERIAL").length,
      PRODUCT: existingItems.filter((i) => i.type === "PRODUCT").length,
    };

    let imported = 0;
    let skipped = 0;
    for (const row of rows) {
      const name = row.name?.trim();
      const type = row.type?.trim().toUpperCase() as ItemType;
      const unit = row.unit?.trim();
      if (!name || !unit || (type !== "RAW_MATERIAL" && type !== "PRODUCT")) {
        skipped++;
        continue;
      }
      if (type === "PRODUCT" && !knownProductNames.has(name.toLowerCase())) {
        skipped++;
        continue;
      }
      if (type === "RAW_MATERIAL" && !knownRawMaterialNames.has(name.toLowerCase())) {
        skipped++;
        continue;
      }
      const categoryName = row.category?.trim();
      const categoryId =
        type === "PRODUCT" && categoryName
          ? categoryByName.get(categoryName.toLowerCase()) ?? null
          : null;

      const variantKey = computeVariantKey(name, type, categoryId);
      if (existingVariantKeys.has(variantKey) || seenInBatch.has(variantKey)) {
        skipped++;
        continue;
      }
      seenInBatch.add(variantKey);

      sequence[type] += 1;
      const code = generateItemCode(type, sequence[type]);

      await prisma.item.create({
        data: {
          name,
          type,
          unit,
          group: row.group?.trim() || null,
          categoryId,
          openingStock: toNumber(row.openingStock, 0),
          reorderLevel: toNumber(row.reorderLevel, 0),
          notes: row.notes?.trim() || null,
          code,
          variantKey,
        },
      });
      imported++;
    }

    return NextResponse.json({ imported, skipped });
  });
}
