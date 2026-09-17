import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productionSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const params = request.nextUrl.searchParams;
    const itemId = params.get("itemId") ?? undefined;
    const from = params.get("from");
    const to = params.get("to");

    const productions = await prisma.production.findMany({
      where: {
        itemId,
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      orderBy: { date: "desc" },
      include: { item: { include: { category: true } } },
    });
    return NextResponse.json(productions);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = productionSchema.parse(body);

    const item = await prisma.item.findUnique({ where: { id: data.itemId } });
    if (!item) return jsonError("Selected product was not found.", 404);
    if (item.type !== "PRODUCT") {
      return jsonError("Only finished products can have production entries.", 422);
    }

    const production = await prisma.production.create({
      data: {
        date: data.date,
        itemId: data.itemId,
        quantity: data.quantity,
        notes: data.notes || null,
      },
      include: { item: { include: { category: true } } },
    });
    return NextResponse.json(production, { status: 201 });
  });
}
