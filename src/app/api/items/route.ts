import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { itemSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";
import { generateItemCode, computeVariantKey } from "@/lib/item-code";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const type = request.nextUrl.searchParams.get("type");
    const items = await prisma.item.findMany({
      where: type ? { type: type as "RAW_MATERIAL" | "PRODUCT" } : undefined,
      orderBy: { name: "asc" },
      include: {
        category: true,
        _count: { select: { purchases: true, sales: true, productions: true } },
        purchases: { select: { quantity: true } },
        sales: { select: { quantity: true } },
        productions: { select: { quantity: true } },
      },
    });

    const withStock = items.map((item) => {
      const purchasedQty = item.purchases.reduce((s, p) => s + p.quantity, 0);
      const soldQty = item.sales.reduce((s, sale) => s + sale.quantity, 0);
      const producedQty = item.productions.reduce((s, p) => s + p.quantity, 0);
      const stock =
        item.type === "RAW_MATERIAL"
          ? item.openingStock + purchasedQty
          : item.openingStock + producedQty - soldQty;
      const { purchases: _purchases, sales: _sales, productions: _productions, ...rest } = item;
      void _purchases;
      void _sales;
      void _productions;
      return { ...rest, stock, purchasedQty, soldQty, producedQty };
    });

    return NextResponse.json(withStock);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = itemSchema.parse(body);
    const categoryId = data.type === "PRODUCT" ? data.categoryId || null : null;

    if (data.type === "PRODUCT") {
      const known = await prisma.productName.findUnique({ where: { name: data.name } });
      if (!known) {
        return jsonError(
          "Please add this product to the Product Name master first.",
          422
        );
      }
    } else {
      const known = await prisma.rawMaterialName.findUnique({ where: { name: data.name } });
      if (!known) {
        return jsonError(
          "Please add this raw material to the Raw Material Name master first.",
          422
        );
      }
    }

    const sequence = (await prisma.item.count({ where: { type: data.type } })) + 1;
    const code = generateItemCode(data.type, sequence);
    const variantKey = computeVariantKey(data.name, data.type, categoryId);

    const existing = await prisma.item.findUnique({ where: { variantKey } });
    if (existing) {
      return jsonError(
        categoryId
          ? "An item with this name already exists for this category."
          : "An item with this name already exists.",
        409
      );
    }

    const item = await prisma.item.create({
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
        code,
        variantKey,
      },
      include: { category: true },
    });
    return NextResponse.json(item, { status: 201 });
  });
}
