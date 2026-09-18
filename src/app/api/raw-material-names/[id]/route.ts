import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rawMaterialNameSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = rawMaterialNameSchema.parse(body);

    const existing = await prisma.rawMaterialName.findUnique({ where: { id } });
    if (!existing) return jsonError("Raw material name not found.", 404);

    // Keep any items that already reference this raw material name in sync —
    // they were set from this master's name at creation, so a rename
    // shouldn't orphan them.
    if (existing.name !== data.name) {
      const inUse = await prisma.item.count({
        where: { name: existing.name, type: "RAW_MATERIAL" },
      });
      if (inUse > 0) {
        return jsonError(
          "This raw material name is used by one or more items. Remove or rename those items first, or add a new raw material name instead.",
          409
        );
      }
    }

    const rawMaterialName = await prisma.rawMaterialName.update({ where: { id }, data });
    return NextResponse.json(rawMaterialName);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const rawMaterialName = await prisma.rawMaterialName.findUnique({ where: { id } });
    if (!rawMaterialName) return jsonError("Raw material name not found.", 404);

    const inUse = await prisma.item.count({
      where: { name: rawMaterialName.name, type: "RAW_MATERIAL" },
    });
    if (inUse > 0) {
      return jsonError(
        "This raw material name is used by one or more items. Mark it inactive instead of deleting.",
        409
      );
    }
    await prisma.rawMaterialName.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
