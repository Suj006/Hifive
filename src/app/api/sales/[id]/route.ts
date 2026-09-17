import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/schemas";
import { withErrorHandling } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = saleSchema.parse(body);
    const sale = await prisma.sale.update({
      where: { id },
      data: {
        ...data,
        invoiceNumber: data.invoiceNumber || null,
        paymentMode: data.paymentMode || null,
        notes: data.notes || null,
      },
      include: { item: true, customer: true },
    });
    return NextResponse.json(sale);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    await prisma.sale.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
