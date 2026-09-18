import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordPaymentSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";

// A lightweight way to record a partial/final payment against a sale's
// existing due, without going through the full edit-sale form.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = recordPaymentSchema.parse(body);

    const sale = await prisma.sale.findUnique({ where: { id } });
    if (!sale) return jsonError("Sale not found.", 404);

    const due = sale.amount - sale.amountPaid;
    if (due <= 0) return jsonError("This sale is already fully paid.", 409);
    if (data.amount > due) {
      return jsonError(`Only ₹${due.toFixed(2)} is due — that's more than what's owed.`, 422);
    }

    const updated = await prisma.sale.update({
      where: { id },
      data: { amountPaid: sale.amountPaid + data.amount },
      include: { item: { include: { category: true } }, customer: true },
    });
    return NextResponse.json(updated);
  });
}
