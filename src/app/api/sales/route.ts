import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";
import { getItemStock } from "@/lib/stock";
import { invoiceDayPrefix, buildSaleInvoiceNumber } from "@/lib/invoice-number";

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
      include: { item: { include: { category: true } }, customer: true },
    });
    return NextResponse.json(sales);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = saleSchema.parse(body);

    const stock = await getItemStock(data.itemId);
    if (stock === null) return jsonError("Selected product was not found.", 404);
    if (data.quantity > stock) {
      return jsonError(
        `Only ${stock} in stock — cannot sell ${data.quantity}.`,
        422
      );
    }

    let couponId: string | null = null;
    let couponCode: string | null = null;
    let couponDiscount = 0;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.trim().toUpperCase() },
      });
      if (!coupon) {
        return jsonError("That coupon code wasn't found. Remove it or pick a valid one.", 422);
      }
      couponId = coupon.id;
      couponCode = coupon.code;
      couponDiscount = data.couponDiscount;
    }

    // Self-describing invoice number (HF-YYYYMMDD-NNN), scoped to the sale's
    // own transaction date so a backdated entry still numbers correctly.
    const countForDay = await prisma.sale.count({
      where: { invoiceNumber: { startsWith: invoiceDayPrefix(data.date) } },
    });
    const invoiceNumber = buildSaleInvoiceNumber(data.date, countForDay + 1);

    const sale = await prisma.sale.create({
      data: {
        date: data.date,
        itemId: data.itemId,
        customerId: data.customerId,
        quantity: data.quantity,
        rate: data.rate,
        discount: data.discount,
        discountType: data.discountType,
        amount: data.amount,
        // Not specified means "paid in full" — the common case.
        amountPaid: data.amountPaid ?? data.amount,
        couponId,
        couponCode,
        couponDiscount,
        invoiceNumber,
        paymentMode: data.paymentMode || null,
        notes: data.notes || null,
      },
      include: { item: { include: { category: true } }, customer: true, coupon: true },
    });
    return NextResponse.json(sale, { status: 201 });
  });
}
