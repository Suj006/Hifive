import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { partySchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = partySchema.parse(body);
    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...data,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
      },
    });
    return NextResponse.json(vendor);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const usage = await prisma.vendor.findUnique({
      where: { id },
      select: { _count: { select: { purchases: true } } },
    });
    if (usage && usage._count.purchases > 0) {
      return jsonError(
        "This vendor has purchase entries linked to it. Mark it inactive instead of deleting.",
        409
      );
    }
    await prisma.vendor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
