import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = couponSchema.parse(body);

    const conflict = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (conflict && conflict.id !== id) {
      return jsonError(`Coupon code "${data.code}" already exists.`, 409);
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: data.code,
        discountType: data.discountType,
        value: data.value,
        maxDiscount: data.discountType === "PERCENT" ? data.maxDiscount ?? null : null,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        oncePerCustomer: data.oncePerCustomer,
        notes: data.notes || null,
        isActive: data.isActive,
      },
    });
    return NextResponse.json(coupon);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const usage = await prisma.coupon.findUnique({
      where: { id },
      select: { _count: { select: { sales: true } } },
    });
    if (usage && usage._count.sales > 0) {
      return jsonError(
        "This coupon has been used on sale entries. Mark it inactive instead of deleting.",
        409
      );
    }
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
