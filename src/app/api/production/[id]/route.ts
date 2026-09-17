import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productionSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = productionSchema.parse(body);

    const item = await prisma.item.findUnique({ where: { id: data.itemId } });
    if (!item) return jsonError("Selected product was not found.", 404);
    if (item.type !== "PRODUCT") {
      return jsonError("Only finished products can have production entries.", 422);
    }

    const production = await prisma.production.update({
      where: { id },
      data: {
        date: data.date,
        itemId: data.itemId,
        quantity: data.quantity,
        notes: data.notes || null,
      },
      include: { item: { include: { category: true } } },
    });
    return NextResponse.json(production);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    await prisma.production.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
