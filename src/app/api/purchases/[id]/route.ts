import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { purchaseSchema } from "@/lib/schemas";
import { withErrorHandling } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = purchaseSchema.parse(body);
    const purchase = await prisma.purchase.update({
      where: { id },
      data: {
        ...data,
        invoiceNumber: data.invoiceNumber || null,
        paymentMode: data.paymentMode || null,
        notes: data.notes || null,
      },
      include: { item: true, vendor: true },
    });
    return NextResponse.json(purchase);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    await prisma.purchase.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
