import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { itemSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = itemSchema.parse(body);
    const item = await prisma.item.update({
      where: { id },
      data: {
        ...data,
        category: data.category || null,
        notes: data.notes || null,
      },
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
