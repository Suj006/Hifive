import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";

export async function GET() {
  return withErrorHandling(async () => {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { sales: true } } },
    });
    return NextResponse.json(coupons);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = couponSchema.parse(body);

    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) {
      return jsonError(`Coupon code "${data.code}" already exists.`, 409);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        discountType: data.discountType,
        value: data.value,
        maxDiscount: data.discountType === "PERCENT" ? data.maxDiscount ?? null : null,
        notes: data.notes || null,
        isActive: data.isActive,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  });
}
