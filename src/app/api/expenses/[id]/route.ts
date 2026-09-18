import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/schemas";
import { withErrorHandling } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = expenseSchema.parse(body);
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...data,
        paymentMode: data.paymentMode || null,
        notes: data.notes || null,
      },
    });
    return NextResponse.json(expense);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
