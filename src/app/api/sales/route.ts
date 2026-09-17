import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/schemas";
import { withErrorHandling } from "@/lib/api";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const params = request.nextUrl.searchParams;
    const itemId = params.get("itemId") ?? undefined;
    const customerId = params.get("customerId") ?? undefined;
    const from = params.get("from");
    const to = params.get("to");

    const sales = await prisma.sale.findMany({
      where: {
        itemId,
        customerId,
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      orderBy: { date: "desc" },
      include: { item: true, customer: true },
    });
    return NextResponse.json(sales);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = saleSchema.parse(body);
    const sale = await prisma.sale.create({
      data: {
        ...data,
        invoiceNumber: data.invoiceNumber || null,
        paymentMode: data.paymentMode || null,
        notes: data.notes || null,
      },
      include: { item: true, customer: true },
    });
    return NextResponse.json(sale, { status: 201 });
  });
}
