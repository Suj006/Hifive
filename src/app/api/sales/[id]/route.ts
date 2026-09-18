import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";
import { getItemStock } from "@/lib/stock";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = saleSchema.parse(body);

    const existing = await prisma.sale.findUnique({
      where: { id },
      select: { itemId: true, quantity: true, amountPaid: true },
    });
    if (!existing) return jsonError("Sale not found.", 404);

    const stock = await getItemStock(data.itemId);
    if (stock === null) return jsonError("Selected product was not found.", 404);
    // This sale's own current quantity is still counted as "sold" in getItemStock,
    // so add it back when re-checking the same item (it will be replaced, not added).
    const available = existing.itemId === data.itemId ? stock + existing.quantity : stock;
    if (data.quantity > available) {
      return jsonError(
        `Only ${available} in stock — cannot sell ${data.quantity}.`,
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

    // invoiceNumber is intentionally left untouched — it's assigned once at
    // creation (src/app/api/sales/route.ts) and never regenerated on edit.
    // amountPaid falls back to whatever it already was, not the full amount
    // — an omitted field here must never silently clear a recorded due.
    const sale = await prisma.sale.update({
      where: { id },
      data: {
        date: data.date,
        itemId: data.itemId,
        customerId: data.customerId,
        quantity: data.quantity,
        rate: data.rate,
        discount: data.discount,
        discountType: data.discountType,
        amount: data.amount,
        amountPaid: data.amountPaid ?? existing.amountPaid,
        couponId,
        couponCode,
        couponDiscount,
        paymentMode: data.paymentMode || null,
        notes: data.notes || null,
      },
      include: { item: { include: { category: true } }, customer: true, coupon: true },
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
