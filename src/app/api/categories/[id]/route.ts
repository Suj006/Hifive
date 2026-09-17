import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = categorySchema.parse(body);
    const category = await prisma.category.update({ where: { id }, data });
    return NextResponse.json(category);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const usage = await prisma.category.findUnique({
      where: { id },
      select: { _count: { select: { items: true } } },
    });
    if (usage && usage._count.items > 0) {
      return jsonError(
        "This category is used by one or more products. Mark it inactive instead of deleting.",
        409
      );
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
