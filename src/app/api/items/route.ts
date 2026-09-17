import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { itemSchema } from "@/lib/schemas";
import { withErrorHandling } from "@/lib/api";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const type = request.nextUrl.searchParams.get("type");
    const items = await prisma.item.findMany({
      where: type ? { type: type as "RAW_MATERIAL" | "PRODUCT" } : undefined,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { purchases: true, sales: true } },
        purchases: { select: { quantity: true } },
        sales: { select: { quantity: true } },
      },
    });

    const withStock = items.map((item) => {
      const purchasedQty = item.purchases.reduce((s, p) => s + p.quantity, 0);
      const soldQty = item.sales.reduce((s, sale) => s + sale.quantity, 0);
      const stock =
        item.type === "RAW_MATERIAL"
          ? item.openingStock + purchasedQty
          : item.openingStock - soldQty;
      const { purchases: _purchases, sales: _sales, ...rest } = item;
      void _purchases;
      void _sales;
      return { ...rest, stock, purchasedQty, soldQty };
    });

    return NextResponse.json(withStock);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = itemSchema.parse(body);
    const item = await prisma.item.create({
      data: {
        ...data,
        category: data.category || null,
        notes: data.notes || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  });
}
