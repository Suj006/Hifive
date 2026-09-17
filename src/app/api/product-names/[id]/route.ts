import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productNameSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = productNameSchema.parse(body);

    const existing = await prisma.productName.findUnique({ where: { id } });
    if (!existing) return jsonError("Product name not found.", 404);

    // Keep any items that already reference this product name in sync — they were
    // set from this master's name at creation, so a rename shouldn't orphan them.
    if (existing.name !== data.name) {
      const inUse = await prisma.item.count({
        where: { name: existing.name, type: "PRODUCT" },
      });
      if (inUse > 0) {
        return jsonError(
          "This product name is used by one or more items. Remove or rename those items first, or add a new product name instead.",
          409
        );
      }
    }

    const productName = await prisma.productName.update({ where: { id }, data });
    return NextResponse.json(productName);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const productName = await prisma.productName.findUnique({ where: { id } });
    if (!productName) return jsonError("Product name not found.", 404);

    const inUse = await prisma.item.count({
      where: { name: productName.name, type: "PRODUCT" },
    });
    if (inUse > 0) {
      return jsonError(
        "This product name is used by one or more items. Mark it inactive instead of deleting.",
        409
      );
    }
    await prisma.productName.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
