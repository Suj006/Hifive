import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { purchaseSchema } from "@/lib/schemas";
import { withErrorHandling } from "@/lib/api";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const params = request.nextUrl.searchParams;
    const itemId = params.get("itemId") ?? undefined;
    const vendorId = params.get("vendorId") ?? undefined;
    const from = params.get("from");
    const to = params.get("to");

    const purchases = await prisma.purchase.findMany({
      where: {
        itemId,
        vendorId,
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      orderBy: { date: "desc" },
      include: { item: true, vendor: true },
    });
    return NextResponse.json(purchases);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = purchaseSchema.parse(body);
    const purchase = await prisma.purchase.create({
      data: {
        ...data,
        invoiceNumber: data.invoiceNumber || null,
        paymentMode: data.paymentMode || null,
        notes: data.notes || null,
      },
      include: { item: true, vendor: true },
    });
    return NextResponse.json(purchase, { status: 201 });
  });
}
