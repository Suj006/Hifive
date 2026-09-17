import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { itemSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";
import { computeVariantKey } from "@/lib/item-code";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = itemSchema.parse(body);
    const categoryId = data.type === "PRODUCT" ? data.categoryId || null : null;
    const variantKey = computeVariantKey(data.name, data.type, categoryId);

    const conflict = await prisma.item.findUnique({ where: { variantKey } });
    if (conflict && conflict.id !== id) {
      return jsonError(
        categoryId
          ? "An item with this name already exists for this category."
          : "An item with this name already exists.",
        409
      );
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        unit: data.unit,
        group: data.group || null,
        categoryId,
        openingStock: data.openingStock,
        reorderLevel: data.reorderLevel,
        notes: data.notes || null,
        isActive: data.isActive,
        variantKey,
      },
      include: { category: true },
    });
    return NextResponse.json(item);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const usage = await prisma.item.findUnique({
      where: { id },
      select: { _count: { select: { purchases: true, sales: true } } },
    });
    if (usage && (usage._count.purchases > 0 || usage._count.sales > 0)) {
      return jsonError(
        "This item has purchase/sale entries linked to it. Mark it inactive instead of deleting.",
        409
      );
    }
    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
